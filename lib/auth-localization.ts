import type { AuthView } from "@neondatabase/auth/react";
import type { ComponentProps } from "react";

type AuthLocalization = NonNullable<
  ComponentProps<typeof AuthView>["localization"]
>;

export const authLocalization: AuthLocalization = {
  // 共通項目
  EMAIL: "メールアドレス",
  EMAIL_PLACEHOLDER: "メールアドレスを入力",
  NAME: "名前",
  NAME_PLACEHOLDER: "お名前を入力",
  PASSWORD: "パスワード",
  PASSWORD_PLACEHOLDER: "パスワードを入力",

  // ログイン画面
  ALREADY_HAVE_AN_ACCOUNT: "すでにアカウントをお持ちですか？",
  DONT_HAVE_AN_ACCOUNT: "アカウントをお持ちでないですか？",
  SIGN_IN: "ログイン",
  SIGN_IN_ACTION: "ログイン",
  SIGN_IN_DESCRIPTION: "メールアドレスを入力してログインしてください。",

  // 新規登録画面
  SIGN_UP: "新規登録",
  SIGN_UP_ACTION: "アカウントを作成",
  SIGN_UP_DESCRIPTION: "以下の情報を入力してアカウントを作成してください。",
  SIGN_UP_EMAIL: "メールをご確認ください。登録確認リンクをお送りしました。",

  // パスワード再設定画面
  FORGOT_PASSWORD: "パスワードをお忘れですか？",
  FORGOT_PASSWORD_ACTION: "再設定用リンクを送信",
  FORGOT_PASSWORD_DESCRIPTION: "パスワードを再設定するメールアドレスを入力してください。",
  FORGOT_PASSWORD_LINK: "パスワードをお忘れですか？",
  GO_BACK: "戻る",

  // 入力チェックとエラー表示
  EMAIL_INSTRUCTIONS: "有効なメールアドレスを入力してください。",
  EMAIL_REQUIRED: "メールアドレスを入力してください。",
  INVALID_EMAIL: "有効なメールアドレスを入力してください。",
  INVALID_EMAIL_OR_PASSWORD: "メールアドレスまたはパスワードが正しくありません。",
  INVALID_USERNAME_OR_PASSWORD: "ユーザー名またはパスワードが正しくありません。",
  IS_INVALID: "を正しく入力してください。",
  IS_REQUIRED: "を入力してください。",
  NAME_INSTRUCTIONS: "名前は32文字以内で入力してください。",
  PASSWORD_REQUIRED: "パスワードを入力してください。",
  PASSWORD_TOO_LONG: "パスワードが長すぎます。",
  PASSWORD_TOO_SHORT: "パスワードが短すぎます。",
  REQUEST_FAILED: "リクエストに失敗しました。もう一度お試しください。",
  UNEXPECTED_ERROR: "予期しないエラーが発生しました。もう一度お試しください。",
};