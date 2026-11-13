"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type PublicEventFilterDialogProps = {
  keyword: string;
  from: string;
  to: string;
  today: string;
};

export function PublicEventFilterDialog({
  keyword,
  from,
  to,
  today,
}: PublicEventFilterDialogProps) {
  // 一覧に適用済みの条件を、モーダル内で編集するための状態。
  const [draftKeyword, setDraftKeyword] = useState(keyword);
  const [draftFrom, setDraftFrom] = useState(from);
  const [draftTo, setDraftTo] = useState(to);
  // 開催日の前後関係が不正な場合に表示するメッセージ。
  const [dateError, setDateError] = useState("");
  // 表示中かどうかを管理し、HTMLダイアログを参照する。
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  // 確定したフィルター条件をイベント一覧のURLに反映する。
  const router = useRouter();

  useEffect(() => {
    // 状態に合わせてネイティブダイアログを開閉する。
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    // eventはフィルターフォームの送信イベントで、OKを押すまで条件は適用しない。
    event.preventDefault();
    if (draftFrom && draftTo && draftFrom > draftTo) {
      setDateError("開始日以降の日付を入力してください。");
      return;
    }
    if ((draftFrom && draftFrom < today) || (draftTo && draftTo < today)) {
      setDateError("開催日は今日以降の日付を指定してください。");
      return;
    }

    // 入力された条件だけをURLクエリに追加する。
    const params = new URLSearchParams();
    if (draftKeyword.trim()) params.set("keyword", draftKeyword.trim());
    if (draftFrom) params.set("from", draftFrom);
    if (draftTo) params.set("to", draftTo);

    setDateError("");
    setIsOpen(false);
    router.push(params.size ? `/events?${params.toString()}` : "/events");
  }

  function clearDraftFilters() {
    // 条件解除は下書きに反映し、OKを押すまで一覧を変更しない。
    setDraftKeyword("");
    setDraftFrom("");
    setDraftTo("");
    setDateError("");
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDialogElement>) {
    // ダイアログ外をクリックした場合は変更を適用せず閉じる。
    if (event.target === event.currentTarget) {
      setIsOpen(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          // モーダルを開くたびに、現在適用中の条件から編集を始める。
          setDraftKeyword(keyword);
          setDraftFrom(from);
          setDraftTo(to);
          setDateError("");
          setIsOpen(true);
        }}
      >
        条件をフィルタリングする
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby="event-filter-title"
        aria-describedby="event-filter-description"
        className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        onCancel={(event) => {
          // Escapeで閉じても、モーダル内の変更は適用しない。
          event.preventDefault();
          setIsOpen(false);
        }}
        onClose={() => setIsOpen(false)}
        onClick={handleBackdropClick}
      >
        <form className="space-y-5 p-6" onSubmit={applyFilters}>
          <div className="space-y-2">
            <h2
              id="event-filter-title"
              className="text-lg font-semibold tracking-tight"
            >
              イベントを絞り込む
            </h2>
            <p
              id="event-filter-description"
              className="text-sm leading-6 text-muted-foreground"
            >
              キーワードと開催日を指定してください。
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-keyword">キーワード</Label>
            <Input
              id="event-keyword"
              type="search"
              value={draftKeyword}
              onChange={(event) => setDraftKeyword(event.target.value)}
              placeholder="タイトル・説明・開催場所"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event-date-from">開催日（開始）</Label>
              <Input
                id="event-date-from"
                type="date"
                value={draftFrom}
                min={today}
                onChange={(event) => setDraftFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-date-to">開催日（終了）</Label>
              <Input
                id="event-date-to"
                type="date"
                value={draftTo}
                min={today}
                onChange={(event) => setDraftTo(event.target.value)}
              />
            </div>
          </div>

          {dateError ? (
            <p role="alert" className="text-sm text-destructive">
              {dateError}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={clearDraftFilters}
            >
              検索条件を解除
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                キャンセル
              </Button>
              <Button type="submit">OK</Button>
            </div>
          </div>
        </form>
      </dialog>
    </>
  );
}
