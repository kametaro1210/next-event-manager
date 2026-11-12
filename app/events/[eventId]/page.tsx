import { DelayedSpinner } from "@/components/delayed-spinner";
import { EventDetailContent } from "@/components/event-detail-content";
import { getSession } from "@/lib/auth/server";
import { connection } from "next/server";
import { Suspense } from "react";

export default function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  return (
    <Suspense fallback={<DelayedSpinner />}>
      <EventDetailsPageContent params={params} />
    </Suspense>
  );
}

async function EventDetailsPageContent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {

  // Webページなどを画面に表示・構築（レンダリング）する際、非同期の接続を確立・待機する
  await connection();
  
  const { eventId } = await params;
  const session = await getSession();
  const userId = session.data?.user.id

  // ユーザー情報がなければ、未認証としてエラーにする。
  if (!userId) {
      throw new Error("Unauthorized.")
  }

  return <EventDetailContent userId={userId} eventId={eventId} />;
}