import type { AccountView } from "@neondatabase/auth/react";
import type { ComponentProps } from "react";

type AccountLocalization = NonNullable<
  ComponentProps<typeof AccountView>["localization"]
>;

export const accountLocalization: AccountLocalization = {
  // アカウント画面
  ACCOUNT: "アカウント",
  EMAIL: "メールアドレス",
  EMAIL_DESCRIPTION: "ログインに使用するメールアドレスを入力してください。",
  EMAIL_INSTRUCTIONS: "有効なメールアドレスを入力してください。",
  EMAIL_PLACEHOLDER: "メールアドレスを入力",
  NAME: "名前",
  NAME_DESCRIPTION: "氏名または表示名を入力してください。",
  NAME_INSTRUCTIONS: "名前は32文字以内で入力してください。",
  NAME_PLACEHOLDER: "名前を入力",

  // セキュリティ画面
  SECURITY: "セキュリティ",
  CHANGE_PASSWORD: "パスワードを変更",
  CHANGE_PASSWORD_DESCRIPTION: "現在のパスワードと新しいパスワードを入力してください。",
  CHANGE_PASSWORD_INSTRUCTIONS: "パスワードは8文字以上で入力してください。",
  CURRENT_PASSWORD: "現在のパスワード",
  CURRENT_PASSWORD_PLACEHOLDER: "現在のパスワード",
  NEW_PASSWORD: "新しいパスワード",
  NEW_PASSWORD_PLACEHOLDER: "新しいパスワード",
  CURRENT_SESSION: "現在のセッション",
  SESSIONS: "セッション",
  SESSIONS_DESCRIPTION: "現在有効なセッションを管理し、アクセスを取り消します。",
  SIGN_OUT: "ログアウト",

  // 共通項目
  SAVE: "保存",
};
