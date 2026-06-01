import Link from "next/link";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const authError = params.error === "auth";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Cipherwill</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Sign in with Google to access your dashboard.
          </p>
        </div>

        {authError && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-300">
            Sign-in failed. Please try again.
          </p>
        )}

        <div className="flex justify-center">
          <GoogleSignInButton />
        </div>

        <p className="text-sm text-zinc-500">
          <Link href="/" className="underline-offset-4 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
