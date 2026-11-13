import { countByStatus } from "@/components/dashboard-content";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { PublicEventFilterDialog } from "./public-event-filter-dialog";

type PublicEventsContentProps = {
  keyword: string;
  from: string;
  to: string;
  reserved: boolean;
};

function getJapanDateString(date: Date) {
  // 日付境界の計算に使う、日本時間の年月日パーツを取得する。
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  // 日本時間の日付をdate型入力で使えるYYYY-MM-DD形式にまとめる。
  const dateParts: Record<string, string> = {};
  for (const part of parts) {
    dateParts[part.type] = part.value;
  }
  return `${dateParts.year}-${dateParts.month}-${dateParts.day}`;
}

// dateは検索日、isExclusiveEndは終了日の翌日境界を求めるかを示す。
function getJapanDateBoundary(date: string, isExclusiveEnd: boolean) {
  // YYYY-MM-DD形式以外の検索日付は境界値として使用しない。
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null;
  }

  // UTC上で実在する日付かを確認する。
  const utcDate = new Date(`${date}T00:00:00.000Z`);
  if (
    Number.isNaN(utcDate.getTime()) ||
    utcDate.toISOString().slice(0, 10) !== date
  ) {
    return null;
  }

  // 日本時間の当日0時、または指定日の翌日0時を検索境界にする。
  const dayOffset = isExclusiveEnd ? 24 * 60 * 60 * 1000 : 0;
  return new Date(utcDate.getTime() + dayOffset - 9 * 60 * 60 * 1000);
}

// keyword/from/toは検索条件、reservedは予約完了メッセージの表示状態。
export async function PublicEventsContent({
  keyword,
  from,
  to,
  reserved,
}: PublicEventsContentProps) {
  // 今日の日本時間日付と、イベント一覧に含める最早時刻を取得する。
  const today = getJapanDateString(new Date());
  const todayBoundary = getJapanDateBoundary(today, false);
  if (!todayBoundary) {
    throw new Error("今日の日付からイベント検索境界を作成できません。");
  }
  // 日付フィルターの開始・終了境界を日本時間で作成する。
  const startDate = from ? getJapanDateBoundary(from, false) : null;
  const endDate = to ? getJapanDateBoundary(to, true) : null;
  // 入力されたキーワードを前後の空白を除いて検索に使う。
  const normalizedKeyword = keyword.trim();
  // キーワードと日付条件を組み合わせて、出欠状況を含む全イベントを取得する。
  const rows = await prisma.event.findMany({
    where: {
      AND: [
        {
          OR: [
            { eventDate: { gte: todayBoundary } },
            { eventDate: null },
          ],
        },
        ...(normalizedKeyword
          ? [
              {
                OR: [
                  {
                    title: {
                      contains: normalizedKeyword,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    description: {
                      contains: normalizedKeyword,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    location: {
                      contains: normalizedKeyword,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            ]
          : []),
        ...(startDate ? [{ eventDate: { gte: startDate } }] : []),
        ...(endDate ? [{ eventDate: { lt: endDate } }] : []),
      ],
    },
    orderBy: [{ eventDate: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      eventDate: true,
      ownerUserId: true,
      rsvps: { select: { status: true } },
    },
  });
  // 一覧に含まれる作成者IDを重複なく集める。
  const ownerIds = [...new Set(rows.map((event) => event.ownerUserId))];
  // Neon Authのユーザーテーブルから、作成者IDと登録名をまとめて取得する。
  const ownerRows = ownerIds.length
    ? await prisma.$queryRaw<{ id: string; name: string | null }[]>`
        SELECT "id", "name"
        FROM "neon_auth"."user"
        WHERE "id" IN (${Prisma.join(ownerIds)})
      `
    : [];
  // 企画者IDから名前を引けるように対応表を作る。
  const organizerNames = new Map(
    ownerRows.map((owner) => [owner.id, owner.name?.trim() || "名前未設定"]),
  );
  // イベントごとに企画者名と参加・未定・不参加の人数をまとめる。
  const events = rows.map((event) => ({
    ...event,
    organizerName: organizerNames.get(event.ownerUserId) ?? "名前未設定",
    ...countByStatus(event.rsvps),
  }));

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            イベント一覧
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            みんなが登録したイベントを閲覧・予約できます。
          </p>
        </div>
        <PublicEventFilterDialog
          keyword={keyword}
          from={from}
          to={to}
          today={today}
        />
      </div>

      {reserved ? (
        <p
          role="status"
          className="rounded-md border border-[var(--accent)]/50 bg-[var(--accent)]/15 p-3 text-sm"
        >
          イベントの予約を受け付けました。
        </p>
      ) : null}

      {events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>該当するイベントはありません</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--muted-foreground)]">
              検索条件を変更して、もう一度お試しください。
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {/* 取得した各イベントを概要と予約ページへのリンクとして表示する。 */}
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="min-w-0 flex-1 break-words text-lg">
                    {event.title}
                  </CardTitle>
                  <Badge variant="secondary">イベント</Badge>
                </div>
                <p className="break-words text-sm">
                  {event.eventDate
                    ? event.eventDate.toLocaleString("ja-JP", {
                        timeZone: "Asia/Tokyo",
                      })
                    : "日時未設定"}
                  {event.location ? ` - ${event.location}` : ""}
                </p>
                <p className="break-words text-sm text-[var(--muted-foreground)]">
                  企画者: {event.organizerName}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge>参加人数: {event.goingCount}</Badge>
                  <Badge variant="secondary">
                    未定人数: {event.maybeCount}
                  </Badge>
                  <Badge variant="outline">
                    不参加人数: {event.notGoingCount}
                  </Badge>
                </div>
                {event.description ? (
                  <p className="whitespace-pre-wrap break-words text-sm text-[var(--muted-foreground)]">
                    {event.description}
                  </p>
                ) : null}
                <Button asChild className="w-fit">
                  <Link href={`/events/${event.id}/reserve`}>詳細・予約</Link>
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
