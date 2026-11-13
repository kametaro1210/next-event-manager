import { submitPublicRsvpAction } from "@/lib/actions/events";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Form, FormField } from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

// eventIdは一覧から選択された、予約対象イベントのID。
export async function PublicEventRsvpContent({
  eventId,
}: {
  eventId: string;
}) {
  // イベントIDから予約フォームに表示する公開イベント情報を取得する。
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      eventDate: true,
    },
  });

  if (!event) {
    notFound();
  }

  // イベントIDを予約登録処理に渡して、フォーム用のアクションを作成する。
  const submitRsvpForEvent = submitPublicRsvpAction.bind(null, event.id);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader className="space-y-3">
          <Badge variant="secondary" className="w-fit">
            イベント予約
          </Badge>
          <CardTitle>{event.title}</CardTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            {event.eventDate
              ? event.eventDate.toLocaleString("ja-JP", {
                  timeZone: "Asia/Tokyo",
                })
              : "日時未設定"}
            {event.location ? ` - ${event.location}` : ""}
          </p>
          {event.description ? (
            <p className="whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
              {event.description}
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          <Form action={submitRsvpForEvent}>
            <FormField>
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="お名前を入力してください"
              />
            </FormField>

            <FormField>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="メールアドレスを入力してください"
              />
            </FormField>

            <FormField>
              <Label htmlFor="status">出欠確認</Label>
              <select
                id="status"
                name="status"
                required
                defaultValue="参加する"
                className="flex h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
              >
                <option value="参加する">参加する</option>
                <option value="未定">未定</option>
                <option value="不参加">不参加</option>
              </select>
            </FormField>

            <div className="flex flex-wrap gap-2">
              <Button type="submit">予約する</Button>
              <Button variant="outline" asChild>
                <Link href="/events">イベント一覧へ戻る</Link>
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
