import { NextRequest, NextResponse } from "next/server";

/*
  Server ActionのPOSTリクエストか判定する処理

  【引数】
  - request：判定するリクエスト。

  【処理フロー】
  1. リクエストのメソッドがPOST以外ならfalseを返し、呼び出し元で通常の認証処理へ進む。
  2. POSTかつNext-Actionヘッダーがあればtrueを返し、呼び出し元で認証を通さず次の処理へ進む。
*/

function isServerActionPost(request: NextRequest) {
  if (request.method !== "POST") return false;
  const h = request.headers;
  return Boolean(h.get("Next-Action") ?? h.get("next-action"));
}

// ---------------------------------------------------------------------

/*
  リクエストに応じて認証処理を行う処理

  【引数】
  - request：処理するリクエスト。

  【処理フロー】
  1. Server ActionのPOSTなら、認証を通さず次の処理へ進める。
  2. それ以外は認証処理を呼び出し、未ログイン時の遷移先をサインイン画面にする。
*/

export default async function proxy(request: NextRequest) {
  if (isServerActionPost(request)) {
    return NextResponse.next();
  }
  const { auth } = await import("@/lib/auth/server");
  return auth.middleware({ loginUrl: "/auth/sign-in" })(request);
}

// ---------------------------------------------------------------------

// Proxyを実行する対象のURLパスを指定する設定。
export const config = {
  matcher: ["/dashboard/:path*"],
};
