"use server";

import { RsvpStatus } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../auth/server";
import { prisma } from "../prisma";

/*
  イベント作成・編集フォームの入力を確認・整形する処理

  【引数】
  - formData：イベント名、概要、開催場所、開催日時を受け取るフォームデータ。

  【処理フロー】
  1. 各項目を文字列にして、前後の空白を取り除く。
  2. イベント名が3〜120文字か確認し、範囲外ならエラーにする。
  3. 概要を2000文字、開催場所を200文字までに制限し、未入力ならnullにする。
  4. 開催日時が入力されていれば日時として有効か確認する。
  5. 日本時間で今日より前の日付ならエラーにし、未入力ならnullにして各項目を返す。
*/

function parseCreateEvent(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 3 || title.length > 120) {
    throw new Error("タイトルは3文字以上120文字以内で入力してください。");
  }
  const description = String(formData.get("description") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const eventDate = String(formData.get("eventDate") ?? "").trim();
  if (eventDate) {
    const parsedEventDate = new Date(eventDate);
    if (Number.isNaN(parsedEventDate.getTime())) {
      throw new Error("有効な開催日時を入力してください。");
    }

    const todayParts = Object.fromEntries(
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .formatToParts(new Date())
        .map(({ type, value }) => [type, value]),
    );
    const today = `${todayParts.year}-${todayParts.month}-${todayParts.day}`;

    if (eventDate.slice(0, 10) < today) {
      throw new Error("今日より前の日付は指定できません");
    }
  }

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
  2. parseCreateEventでフォーム入力を確認・整形し、開催日時が過去日でないことも確認する。
  3. ユーザーIDと入力内容を使って、Prismaでイベントを作成する。
  4. 開催日時が入力されていればDateに変換し、作成処理後にイベント一覧へ移動する。
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

    redirect("/dashboard");
}

// --------------------------------------------------------------------------

/*
  イベント情報を更新する処理

  【引数】
  - eventId：更新するイベントのID。
  - formData：イベント編集フォームの入力データ。

  【処理フロー】
  1. セッションからログインユーザーのIDを取得する。
  2. parseCreateEventでフォーム入力を確認・整形し、開催日時が過去日でないことも確認する。
  3. イベントIDとユーザーIDを条件に、所有者本人のイベント情報を更新する。
  4. 対象イベントがなければエラーにする。
  5. イベント名や日時などの更新内容が一覧と詳細画面に反映されるよう、それぞれのキャッシュを無効化する。
  6. 更新後のイベント詳細画面へ移動する。
*/

export async function updateEventAction(
  eventId: string,
  formData: FormData,
) {
  const session = await getSession();
  const userId = session.data?.user.id;
  if (!userId) {
    throw new Error("Unauthorized.");
  }

  const input = parseCreateEvent(formData);
  const result = await prisma.event.updateMany({
    where: { id: eventId, ownerUserId: userId },
    data: {
      title: input.title,
      description: input.description,
      location: input.location,
      eventDate: input.eventDate ? new Date(input.eventDate) : null,
    },
  });

  if (result.count === 0) {
    throw new Error("Event not found.");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/events/${eventId}`);
  redirect(`/events/${eventId}`);
}

// --------------------------------------------------------------------------

/*
  イベントを削除する処理

  【引数】
  - eventId：削除するイベントのID。

  【処理フロー】
  1. セッションからログインユーザーのIDを取得する。
  2. イベントIDとユーザーIDを条件に、所有者本人のイベントを削除する。
  3. 対象イベントがなければエラーにする。
  4. イベントと、そのイベントに紐づく招待・出欠回答の削除を
      一覧画面に反映するため、一覧と詳細画面のキャッシュを無効化する。
  5. 削除後、イベント一覧へ移動する。
*/

export async function deleteEventAction(eventId: string) {
  const session = await getSession();
  const userId = session.data?.user.id;
  if (!userId) {
    throw new Error("Unauthorized.");
  }

  const result = await prisma.event.deleteMany({
    where: { id: eventId, ownerUserId: userId },
  });

  if (result.count === 0) {
    throw new Error("Event not found.");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/events/${eventId}`);
  redirect("/dashboard");
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
