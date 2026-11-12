import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col gap-8">
      <section className="space-y-4">
        <Badge variant="secondary" className="w-fit">
          Next.js 16 + Neon Auth + Neon Postgres
        </Badge>
        <h1 className="text-4xl font-semibold tracking-tight">
          イベントの計画と出欠管理をすばやく
        </h1>
        <p className="max-w-2xl text-[var(--muted-foreground)]">
          イベントを作成して専用の招待リンクを共有し、「参加」「未定」「不参加」の人数や出席状況のリアルタイムな更新を確認できます。
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/auth/sign-up">アカウント作成</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/auth/sign-in">サインイン</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/dashboard">ダッシュボードを開く</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>イベントの作成</CardTitle>
            <CardDescription>
              タイトル、日時、詳細をわずか数秒で設定できます。
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>招待リンクの共有</CardTitle>
            <CardDescription>
              イベントごとに固有の招待トークンを生成します。
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>出欠の管理</CardTitle>
            <CardDescription>
              参加者一覧と回答の集計をひと目で確認できます。
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--muted-foreground)]">
            「参加」「未定」「不参加」のステータスは常に最新の状態に保たれます。
          </CardContent>
        </Card>
      </section>
    </div>
  );
}