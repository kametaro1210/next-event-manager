import { DelayedSpinner } from "@/components/delayed-spinner";
import { PublicEventsContent } from "@/components/public-events-content";
import { connection } from "next/server";
import { Suspense } from "react";

type EventsSearchParams = {
  keyword?: string;
  from?: string;
  to?: string;
  reserved?: string;
};

// searchParamsはURLから検索条件と予約完了状態を受け取る。
export default function EventsPage({
  searchParams,
}: {
  searchParams: Promise<EventsSearchParams>;
}) {
  return (
    <Suspense fallback={<DelayedSpinner />}>
      <EventsPageContent searchParams={searchParams} />
    </Suspense>
  );
}

// searchParamsを読み取り、一覧表示に必要な値を公開イベント一覧へ渡す。
async function EventsPageContent({
  searchParams,
}: {
  searchParams: Promise<EventsSearchParams>;
}) {

  // リクエスト時のイベントデータと検索条件でページを描画する。
  await connection();
  
  // URLに含まれるイベント検索条件と予約完了状態を取得する。
  const query = await searchParams;

  return (
    <PublicEventsContent
      keyword={query.keyword ?? ""}
      from={query.from ?? ""}
      to={query.to ?? ""}
      reserved={query.reserved === "1"}
    />
  );
}
