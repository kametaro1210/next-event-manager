import { createInviteLinkAction } from "@/lib/actions/events";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { countByStatus } from "./dashboard-content";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Form } from "./ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

export async function EventDetailContent({
  userId,
  eventId,
}: {
  userId: string;
  eventId: string;
}) {
  
  // イベントIDと主催者のユーザーIDを条件に、イベント情報と招待トークン・回答状況を取得する
  // （該当するイベントがなければnull）。
  const row = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      eventDate: true,
      eventInvites: { select: { token: true } },
      rsvps: { select: { status: true } },
    },
  });

  if (!row) {
    notFound();
  }

  // 取得した回答状況の一覧をcountByStatusに渡し、参加・未定・不参加それぞれの回答数を取得する。
  const counts = countByStatus(row.rsvps);

  // 取得したイベント情報に、ISO形式の日付・招待トークン・出欠ごとの回答数をまとめ、画面表示用のデータを作成する。
  const event = {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    eventDate: row.eventDate ? row.eventDate.toISOString() : null,
    inviteToken: row.eventInvites?.token ?? null,
    goingCount: counts.goingCount,
    maybeCount: counts.maybeCount,
    notGoingCount: counts.notGoingCount,
  };

  // イベントIDを条件に、回答者の名前・メールアドレス・出欠状況・回答日時を、回答日時の新しい順で取得する。
  const rsvpRows = await prisma.eventRsvp.findMany({
    where: { eventId },
    orderBy: { respondedAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      respondedAt: true,
    },
  });

  // 取得した回答一覧を画面表示用に整形し、回答日時をDateオブジェクトからISO形式の文字列に変換する。
  const rsvps = rsvpRows.map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    status: r.status,
    respondedAt: r.respondedAt.toISOString(),
  }));

  // 招待リンク作成アクションにイベントIDをあらかじめ渡し、フォーム送信時にこのイベントの招待リンクを作成できるようにする。
  const createInviteActionForEvent = createInviteLinkAction.bind(
    null,
    event.id,
  );

  // 招待トークンがあればアプリの公開URLと組み合わせて招待URLを作成し、トークンがなければnullにする。
  const inviteUrl = event.inviteToken
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/invite/${event.inviteToken}`
    : null;
    
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {event.title}
          </h1>
          <p>
            {event.eventDate
              ? new Date(event.eventDate).toLocaleString("ja-JP")
              : "日時未設定"
            }

            {event.location ? ` - ${event.location}` : ""}
          </p>
          {event.description && (
            <p className="max-w-2xl text-sm text-[var(--muted-foreground)]">
              {event.description}
            </p>
          )}
        </div>
        <Button asChild variant="outline">
          <Link href={"/dashboard"}>一覧に戻る</Link>
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge>参加: {event.goingCount}</Badge>
        <Badge variant="secondary">未定: {event.maybeCount}</Badge>
        <Badge variant="outline">不参加: {event.notGoingCount}</Badge>
      </div>

      <Card>
        <CardHeader>招待リンク</CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-[var(--muted-foreground)]">
            このリンクを共有すると、ゲストはアカウントを作成せずに出欠を回答できます。
          </p>
          {inviteUrl ? (
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] p-3 text-sm">
              {inviteUrl}
            </div>
          ) : (
            <p className="text-sm text-[var(--muted-foreground)]">
              招待リンクはまだ作成されていません。
            </p>
          )}

          <Form action={createInviteActionForEvent}>
            <Button type="submit">招待リンクを作成</Button>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>参加者</CardTitle>
        </CardHeader>
        <CardContent>
          {rsvps.length === 0 ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              まだ回答はありません。
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名前</TableHead>
                  <TableHead>メールアドレス</TableHead>
                  <TableHead>出欠</TableHead>
                  <TableHead>回答日時</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rsvps.map((rsvp) => (
                  <TableRow key={rsvp.id}>
                    <TableCell>{rsvp.name}</TableCell>
                    <TableCell>{rsvp.email}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {rsvp.status === "不参加"
                          ? "不参加"
                          : rsvp.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(rsvp.respondedAt).toLocaleDateString("ja-JP")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}