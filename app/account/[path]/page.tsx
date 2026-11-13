import { DelayedSpinner } from "@/components/delayed-spinner";
import { accountLocalization } from "@/lib/account-localization";
import { AccountView } from "@neondatabase/auth/react";
import { accountViewPaths } from "@neondatabase/auth/react/ui/server";
import { Suspense } from "react";

export function generateStaticParams() {
  return Object.values(accountViewPaths).map((path) => ({ path }));
}

export default function AccountPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  return (
    <div className="w-full min-w-0 flex-1">
      <Suspense fallback={<DelayedSpinner />}>
        <AccountPageContent params={params} />
      </Suspense>
    </div>
  );
}

async function AccountPageContent({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return <AccountView path={path} localization={accountLocalization} />;
}