import { DelayedSpinner } from "@/components/delayed-spinner";
import { PublicEventRsvpContent } from "@/components/public-event-rsvp-content";
import { connection } from "next/server";
import { Suspense } from "react";

export default function PublicEventReservePage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense fallback={<DelayedSpinner />}>
      <PublicEventReservePageContent params={params} />
    </Suspense>
  );
}

async function PublicEventReservePageContent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  // リクエスト時に公開イベントの予約ページを描画する。
  await connection();
  
  // URLから予約対象のイベントIDを取得する。
  const { eventId } = await params;

  return <PublicEventRsvpContent eventId={eventId} />;
}
