import { InviteRsvpContent } from "@/components/invite-rsvp-content";

export default async function InvitePage({
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