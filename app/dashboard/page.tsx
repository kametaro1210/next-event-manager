import { DashboardContent } from "@/components/dashboard-content"
import { getSession } from "@/lib/auth/server"

export default async function DashboardPage() {
    
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