import { submitOrUpdateRsvpAction } from "@/lib/actions/events";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Form, FormField } from "./ui/form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export async function InviteRsvpContent({
  token,
  submitted,
}: {
  token: string;
  submitted: boolean;
}) {

  // 招待トークンを条件に招待情報と関連するイベント情報を取得する
  // （該当する招待がなければnull）。
  const row = await prisma.eventInvite.findFirst({
    where: { token },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          eventDate: true,
        },
      },
    },
  });

  if (!row) {
    notFound();
  }

  // 取得した招待情報から、関連するイベント情報を取り出す。
  const e = row.event;

  // 取得したイベント情報を画面表示用に整形し、日時をISO形式の文字列に変換する。
  const event = {
    title: e.title,
    description: e.description,
    location: e.location,
    eventDate: e.eventDate ? e.eventDate.toISOString() : null,
  };

  // この招待のtokenを出欠登録処理に渡しておき、
  // フォーム送信時の入力内容を受け取って実行する関数を作る。
  const submitRsvpForToken = submitOrUpdateRsvpAction.bind(null, token);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader className="space-y-3">
          <Badge variant="secondary" className="w-fit">
            参加確認
          </Badge>
          <CardTitle>{event.title}</CardTitle>
          <p className="text-sm text-[var(--muted-foreground)]">
            {event.eventDate
              ? new Date(event.eventDate).toLocaleString()
              : "No date selected"}
            {event.location ? ` - ${event.location}` : ""}
          </p>
          {event.description ? (
            <p className="text-sm text-[var(--muted-foreground)]">
              {event.description}
            </p>
          ) : null}
        </CardHeader>
        <CardContent>
          {submitted ? (
            <p className="mb-4 rounded-md border border-[var(--accent)]/50 bg-[var(--accent)]/15 p-3 text-sm text-[#e9dbff]">
              出欠の登録（または変更）を受け付けました。
            </p>
          ) : null}
          <Form action={submitRsvpForToken}>
            <FormField>
              <Label htmlFor="name">お名前</Label>
              <Input 
              id="name" 
              name="name" 
              required 
              placeholder="Your name" 
            />
            </FormField>

            <FormField>
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="メールアドレスを入力して下さい"
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
            
            <Button type="submit">送信</Button>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}