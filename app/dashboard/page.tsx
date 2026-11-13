import { DashboardContent } from "@/components/dashboard-content"
import { DelayedSpinner } from "@/components/delayed-spinner"
import { getSession } from "@/lib/auth/server"
import { connection } from "next/server"
import { Suspense } from "react"

export default function DashboardPage() {
    return (
        <Suspense fallback={<DelayedSpinner />}>
            <DashboardPageContent />
        </Suspense>
    )
}

async function DashboardPageContent() {

    // Webページなどを画面に表示・構築（レンダリング）する際、非同期の接続を確立・待機する
    await connection()
    
    // ログイン状態とユーザー情報を含むセッションを取得する。
    const session = await getSession()
    
    // セッションからログインユーザーの情報を取得する（未ログインならundefined）。
    const user = session.data?.user

    // ユーザー情報がなければ、未認証としてエラーにする。
    if (!user) {
        throw new Error("Unauthorized.")
    }
    
    return <DashboardContent userId={user.id} />
}