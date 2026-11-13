"use client";

import { Button } from "@/components/ui/button";
import { deleteEventAction } from "@/lib/actions/events";
import { Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function EventDeleteButton({
  eventId,
  eventTitle,
}: {
  eventId: string;
  eventTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        onClick={() => setIsOpen(true)}
      >
        イベントを削除
      </Button>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-event-title"
        aria-describedby="delete-event-description"
        className="fixed left-1/2 top-1/2 m-0 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
        onCancel={(event) => {
          event.preventDefault();
          setIsOpen(false);
        }}
        onClose={() => setIsOpen(false)}
        onClick={handleBackdropClick}
      >
        <div className="space-y-5 p-6">
          <div className="flex items-start gap-4">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Trash2 aria-hidden="true" className="size-5" />
            </div>
            <div className="space-y-2">
              <h2
                id="delete-event-title"
                className="text-lg font-semibold tracking-tight"
              >
                イベントを削除しますか？
              </h2>
              <p
                id="delete-event-description"
                className="text-sm leading-6 text-muted-foreground"
              >
                「{eventTitle}」と、このイベントの招待リンク・出欠回答を削除します。
                この操作は取り消せません。
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              キャンセル
            </Button>
            <form action={deleteEventAction.bind(null, eventId)}>
              <Button type="submit" variant="destructive">
                削除する
              </Button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
