import { InviteRsvpContent } from "@/components/invite-rsvp-content";
import { DelayedSpinner } from "@/components/delayed-spinner";
import { Suspense } from "react";

export default function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  return (
    <Suspense fallback={<DelayedSpinner />}>
      <InvitePageContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function InvitePageContent({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;

  // URLのsubmittedが"1"ならtrue、それ以外ならfalseとなるboolean値を作成する。
  const submitted: boolean = query.submitted === "1";

  // 招待トークンと送信完了状態のboolean値を渡して、出欠フォームを返す。
  return (
    <InviteRsvpContent token={token} submitted={submitted} />
  );
}