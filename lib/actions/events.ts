"use server";

import { RsvpStatus } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../auth/server";
import { prisma } from "../prisma";

/*
  イベント作成フォームの入力を確認・整形する処理

  【引数】
  - formData：イベント名、概要、開催場所、開催日時を受け取るフォームデータ。

  【処理フロー】
  1. 各項目を文字列にして、前後の空白を取り除く。
  2. イベント名が3〜120文字か確認し、範囲外ならエラーにする。
  3. 概要と開催場所は文字数を制限し、未入力ならnullにする。
  4. 開催日時も未入力ならnullにし、整形した各項目を返す。
*/

function parseCreateEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 3 || title.length > 120) {
    throw new Error("タイトルは3文字以上120文字以内で入力してください。");
  }
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  return {
    title,
    description: description.length ? description.slice(0, 2000) : null,
    location: location.length ? location.slice(0, 200) : null,
    eventDate: eventDate.length ? eventDate : null,
  };
}

// --------------------------------------------------------------------------

/*
  イベントを作成する処理

  【引数】
  - formData：イベント作成フォームの入力データ。

  【処理フロー】
  1. セッションからログインユーザーのIDを取得する。
  2. parseCreateEventでフォーム入力を確認・整形する。
  3. ユーザーIDと入力内容を使って、Prismaでイベントを作成する。
  4. 開催日時が入力されていればDateに変換し、作成したイベントのページへ移動する。
  5. 作成中にエラーが発生した場合は、コンソールに出力する。
*/

export async function createEventAction(formData: FormData) {
  const session = await getSession();
  const userId = session.data?.user.id
    if (!userId) {
        throw new Error("Unauthorized.")
    }
  const input = parseCreateEvent(formData);

  try {
    const created = await prisma.event.create({
      data: {
        ownerUserId: userId,
        title: input.title,
        description: input.description,
        location: input.location,
        eventDate: input.eventDate ? new Date(input.eventDate) : null,
      },
    });
    redirect(`/events/${created.id}`);
  } catch (err) {
    console.error(err);
  }
}

// --------------------------------------------------------------------------

/*
  イベントの招待リンクを作成・更新する処理

  【引数】
  - eventId：招待リンクを作成するイベントのID。

  【処理フロー】
  1. セッションからログインユーザーのIDを取得する。
  2. イベントIDとユーザーIDを使って、イベントの所有者であることを確認する。
  3. 所有するイベントがなければエラーにする。
  4. 新しい招待トークンを作り、イベントに招待リンクがあれば更新、なければ作成する。
*/

export async function createInviteLinkAction(eventId: string) {
  const session = await getSession();
  const userId = session.data?.user.id;
    if (!userId) {
      throw new Error("Unauthorized.")
    }

  const owns = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
    select: { id: true },
  });

  if (!owns) {
    throw new Error("Event not found.");
  }

  // ハイフンを除外したランダムなUUID文字列を生成
  const token = crypto.randomUUID().replace(/-/g, "");

  await prisma.eventInvite.upsert({
    where: { eventId },
    create: { eventId, token },
    update: { token },
  });

  // 指定したパスのキャッシュを無効化し、リアルタイムで招待リンクを表示する
  revalidatePath(`/events/${eventId}`);
}

// --------------------------------------------------------------------------

/*
  RSVPで受け付ける出欠ステータスを定義・判定する処理

  【定数】
  - RSVP_STATUSES：PrismaのRsvpStatusから取得した、受け付け可能な出欠ステータスの一覧。

  【引数】
  - s：フォームから受け取った出欠ステータスの文字列。

  【処理フロー】
  1. RSVP_STATUSESに引数sと一致する値があるか確認する。
  2. 一致する値があればtrueを返し、TypeScript上でsをRsvpStatus型として扱えるようにする。
  3. 一致する値がなければfalseを返す。
*/

const RSVP_STATUSES = Object.values(RsvpStatus);

function isRsvpStatus(s: string): s is RsvpStatus {
  return RSVP_STATUSES.some((status) => status === s);
}

// --------------------------------------------------------------------------

/*
  RSVPフォームの入力を確認・整形する処理

  【引数】
  - formData：回答者の名前、メールアドレス、参加状況を受け取るフォームデータ。

  【処理フロー】
  1. 名前とメールアドレスを文字列にして、前後の空白を取り除く。
  2. 名前の文字数とメールアドレスの形式を確認し、不正ならエラーにする。
  3. 参加状況が許可された値か確認し、不正ならエラーにする。
  4. 確認した名前、メールアドレス、参加状況を返す。
*/

function parseRsvp(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 120) {
    throw new Error("名前は2文字以上120文字以内で入力してください。");
  }

  const email = String(formData.get("email") ?? "").trim();
  if (email.length < 3 || email.length > 320 || !email.includes("@")) {
    throw new Error("有効なメールアドレスを入力してください。");
  }

  const status = String(formData.get("status") ?? "").trim();
  if (!isRsvpStatus(status)) {
    throw new Error("無効な出欠ステータスです。");
  }
  
  return { name, email, status };
}

// --------------------------------------------------------------------------

/*
  招待リンクから届いたRSVPを新規登録または更新する処理

  【引数】
  - token：RSVPを受け付ける招待リンクのトークン。
  - formData：回答者の名前、メールアドレス、参加状況を受け取るフォームデータ。

  【処理フロー】
  1. parseRsvpでフォーム入力を確認・整形する。
  2. tokenから招待リンクと対象イベントを検索し、見つからなければエラーにする。
  3. イベントIDと小文字にそろえたメールアドレスを使って、既存の回答を検索する。
  4. 回答があれば更新し、なければ新しく登録する。
  5. 登録・更新後、送信完了を示す招待ページへ移動する。
*/

export async function submitOrUpdateRsvpAction(
  token: string,
  formData: FormData,
) {
  const input = parseRsvp(formData);

  const invite = await prisma.eventInvite.findFirst({
    where: { token },
    select: {
      id: true,
      event: {
        select: { id: true },
      },
    },
  });

  if (!invite) {
    throw new Error("Invite link is invalid.");
  }

  const eventId = invite.event.id;
  const emailNormalized = input.email.toLowerCase();

  await prisma.eventRsvp.upsert({
    where: {
      eventId_emailNormalized: {
        eventId,
        emailNormalized,
      },
    },
    create: {
      eventId,
      inviteId: invite.id,
      name: input.name,
      email: input.email,
      emailNormalized,
      status: input.status,
    },
    update: {
      name: input.name,
      status: input.status,
      respondedAt: new Date(),
    },
  });

  // 回答送信後に招待ページへ戻し、
  // submittedに1のクエリに付けて送信完了メッセージを表示する。
  redirect(`/invite/${token}?submitted=1`);
}
