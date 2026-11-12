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
    <main className="container mx-auto flex grow flex-col items-center justify-center gap-3 self-center p-4 md:p-6">
      <Suspense fallback={<DelayedSpinner />}>
        <AuthPageContent params={params} />
      </Suspense>
    </main>
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