"use client";

import { UserButton } from "@neondatabase/auth/react";
import { Menu } from "lucide-react";
import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative border-b border-[var(--border)]/60 bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="min-w-0 text-sm font-semibold tracking-wide">
          Event Management
        </Link>

        <nav
          className="hidden items-center gap-4 md:flex"
          aria-label="メインメニュー"
        >
          <Link
            href="/dashboard"
            className="text-sm text-[var(--muted-foreground)] hover:text-foreground"
          >
            Dashboard
          </Link>
          <UserButton size="icon" />
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <Link
            href="/dashboard"
            className="text-sm text-[var(--muted-foreground)] hover:text-foreground"
          >
            Dashboard
          </Link>
          <UserButton
            align="end"
            size="default"
            trigger={
              <button
                type="button"
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-[var(--border)] text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="アカウントメニューを開く"
              >
                <Menu aria-hidden="true" size={20} />
              </button>
            }
          />
        </div>
      </div>
    </header>
  );
}
