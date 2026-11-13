import { authLocalization } from "@/lib/auth-localization";
import { DelayedSpinner } from "@/components/delayed-spinner";
import { AuthView } from "@neondatabase/auth/react";
import { Suspense } from "react";

export default function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center gap-3">
      <Suspense fallback={<DelayedSpinner />}>
        <AuthPageContent params={params} />
      </Suspense>
    </div>
  );
}

async function AuthPageContent({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <AuthView path={path} localization={authLocalization} />
  );
}