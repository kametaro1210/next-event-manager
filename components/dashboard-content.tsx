import type { RsvpStatus as PrismaRsvpStatus } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";


/*
  参加状況ごとの回答数を数える処理

  【引数】
  - rsvps：イベントへの回答状況の一覧。

  【処理フロー】
  1. 参加する・未定・不参加の数をそれぞれ0で初期化する。
  2. 回答を順番に確認し、参加状況に合う数を1つ増やす。
  3. 状況ごとの回答数を返す。
*/

export function countByStatus(rsvps: { status: PrismaRsvpStatus }[]) {
  let goingCount = 0;
  let maybeCount = 0;
  let notGoingCount = 0;

  for (const r of rsvps) {
    if (r.status === "参加する") goingCount += 1;
    else if (r.status === "未定") maybeCount += 1;
    else if (r.status === "不参加") notGoingCount += 1;
  }

  return { 
    goingCount, 
    maybeCount, 
    notGoingCount 
  };
}

// ------------------------------------------------------------------------

export async function DashboardContent({ userId }: { userId: string }) {
  
  // ログインユーザーが主催するイベントを、作成日時の新しい順に取得する。
  const rows = await prisma.event.findMany({
    where: { ownerUserId: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      eventDate: true,
      location: true,
      rsvps: { select: { status: true } },
    },
  });

  // 取得したイベント情報を画面表示用に整形し、参加状況ごとの回答数を追加する。
  const events = rows.map((e) => ({
    id: e.id,
    title: e.title,
    eventDate: e.eventDate ? e.eventDate.toISOString() : null,
    location: e.location,
    ...countByStatus(e.rsvps),
  }));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">主催のイベント</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            出欠状況の確認と招待リンクの管理
          </p>
        </div>

        <Button asChild>
          <Link href={"/events/new"}>イベント作成</Link>
        </Button>
      </div>

      {/* イベントの一覧 */}

      {events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>まだイベントはありません</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              イベントを作成してください
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="min-w-0 flex-1 break-words text-lg">{event.title}</CardTitle>
                  <Button size="sm" asChild>
                    <Link href={`/events/${event.id}`}>Open</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge>参加人数: {event.goingCount}</Badge>
                  <Badge variant="secondary"> 検討中人数: {event.maybeCount}</Badge>
                  <Badge variant="outline">
                    {" "}
                    不参加人数: {event.notGoingCount}
                  </Badge>
                </div>
                <p className="break-words text-sm">
                  {event.eventDate
                    ? new Date(event.eventDate).toLocaleString()
                    : "日時の指定がありません"}

                  {event.location ? ` - ${event.location}` : ""}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

}