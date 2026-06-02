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
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black dark:bg-white">
              <span className="text-xl font-bold text-white dark:text-black">🔒</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-black dark:text-white">
            yourcyberwill
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Secure your digital legacy with end-to-end encryption
          </p>
        </div>

        {/* Error Message */}
        {authError && (
          <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              Sign-in failed
            </p>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              Please try again or contact support if the problem persists.
            </p>
          </div>
        )}

        {/* Sign In Button */}
        <div className="space-y-4">
          <GoogleSignInButton />
          <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
            We use Google Sign-In to securely authenticate your account.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-200 pt-6 text-center dark:border-zinc-800">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            New to yourcyberwill?{" "}
            <Link href="/" className="font-medium text-black hover:underline dark:text-white">
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
