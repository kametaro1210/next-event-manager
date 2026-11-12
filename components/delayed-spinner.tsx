"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function DelayedSpinner() {
  const [isVisible, setIsVisible] = useState(false);

  // 2秒以上待機したらローディングを表示
  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="flex min-h-12 items-center justify-center" role="status">
      <Loader2 aria-label="読み込み中" className="size-5 animate-spin" />
    </div>
  );
}
