import { EventDetailContent } from "@/components/event-detail-content";
import { getSession } from "@/lib/auth/server";

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const session = await getSession();
  const userId = session.data?.user.id

  // ユーザー情報がなければ、未認証としてエラーにする。
  if (!userId) {
      throw new Error("Unauthorized.")
  }

  return <EventDetailContent userId={userId} eventId={eventId} />;
}