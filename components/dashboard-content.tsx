import Link from "next/link";
import { Button } from "./ui/button";


export async function DashboardContent({ 
  userId 
}: { 
  userId: string 
}) {

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">主催のイベント</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            出欠状況の確認と招待リンクの管理
          </p>
        </div>

        <Button asChild>
          <Link href={"/events/new"}>イベント作成</Link>
        </Button>
      </div>
    </div>
  );
}