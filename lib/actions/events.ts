"use server";

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
