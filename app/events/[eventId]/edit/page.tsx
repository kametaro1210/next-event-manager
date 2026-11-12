import { DelayedSpinner } from "@/components/delayed-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateEventAction } from "@/lib/actions/events";
import { getSession } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense fallback={<DelayedSpinner />}>
      <EditEventPageContent params={params} />
    </Suspense>
  );
}

async function EditEventPageContent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {

  // Webページなどを画面に表示・構築（レンダリング）する際、非同期の接続を確立・待機する
  await connection();

  const { eventId } = await params;
  const session = await getSession();
  const userId = session.data?.user.id;

  if (!userId) {
    throw new Error("Unauthorized.");
  }

  const event = await prisma.event.findFirst({
    where: { id: eventId, ownerUserId: userId },
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

  const updateEventActionForEvent = updateEventAction.bind(null, event.id);
  const eventDate = event.eventDate
    ? new Date(
        event.eventDate.getTime() -
          event.eventDate.getTimezoneOffset() * 60_000,
      )
        .toISOString()
        .slice(0, 16)
    : "";

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>イベントの編集</CardTitle>
        </CardHeader>

        <CardContent>
          <Form action={updateEventActionForEvent}>
            <FormField>
              <Label htmlFor="title">イベント名</Label>
              <Input
                id="title"
                name="title"
                required
                minLength={3}
                maxLength={120}
                defaultValue={event.title}
                placeholder="開催するイベント名を入力してください..."
              />
            </FormField>

            <FormField>
              <Label htmlFor="description">イベントの概要</Label>
              <Textarea
                id="description"
                name="description"
                maxLength={2000}
                defaultValue={event.description ?? ""}
                placeholder="イベントの概要を入力してください..."
              />
            </FormField>

            <FormField>
              <Label htmlFor="location">開催場所</Label>
              <Input
                id="location"
                name="location"
                maxLength={200}
                defaultValue={event.location ?? ""}
                placeholder="開催場所を入力してください..."
              />
            </FormField>

            <FormField>
              <Label htmlFor="eventDate">開催日時</Label>
              <Input
                id="eventDate"
                name="eventDate"
                type="datetime-local"
                defaultValue={eventDate}
              />
              <FormMessage>※未入力の場合、開催日時は未設定になります。</FormMessage>
            </FormField>

            <div className="flex items-center gap-3">
              <Button type="submit">イベントを更新</Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/events/${event.id}`}>キャンセル</Link>
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
