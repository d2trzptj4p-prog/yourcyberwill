import Link from "next/link";
import { ShieldCheck, ArrowLeft, Warning, GoogleLogo, MagicWand } from "@phosphor-icons/react/dist/ssr";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { MagicLinkForm } from "@/components/magic-link-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AtSign } from "lucide-react";
import { Footer } from "../components/footer";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const authError = params.error === "auth";

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white to-slate-50 dark:from-black dark:to-slate-950">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-slate-200/40 blur-3xl dark:bg-slate-800/30" />
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="absolute left-6 top-6 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-black dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
      >
        <ArrowLeft size={18} weight="bold" />
        <span>Back</span>
      </Link>

      <div className="relative w-full max-w-md mt-22">
        <div className="rounded-3xl border-slate-200 bg-slate-100 p-10! border-2 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-black/40">
          {/* Header */}
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <Link href="/" className="flex items-center gap-2.5 select-none">
              <div className="flex h-12 w-48 items-center justify-center overflow-hidden select-none">
                <img
                  className="min-h-full min-w-full scale-150 object-cover"
                  src="/textlogo.png"
                  alt="yourcyberwill Logo"
                />
              </div>
            </Link>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl text-black dark:text-white">
                Log in
              </h1>
              <p className="text-sm mt-4 text-slate-600 dark:text-slate-400">
                Secure your digital legacy with end-to-end encryption
              </p>
            </div>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mt-6 flex gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/60 dark:bg-red-950/30">
              <Warning
                size={20}
                weight="fill"
                className="mt-0.5 shrink-0 text-red-600 dark:text-red-400"
              />
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                  Sign-in failed
                </p>
                <p className="mt-0.5 text-sm text-red-700 dark:text-red-300">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
            </div>
          )}

          {/* Sign In Options */}
          <Tabs defaultValue="google" className="mt-8 w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-200 cursor-pointer">
              <TabsTrigger value="google" className="flex items-center gap-1.5">
                <GoogleLogo size={16} weight="bold" />
                Google
              </TabsTrigger>
              <TabsTrigger value="magic" className="flex items-center gap-1.5">
                <AtSign size={16} weight="bold" />
                Email
              </TabsTrigger>
            </TabsList>

            <TabsContent value="google" className="mt-5 space-y-4 w-full">
              <div className="w-full">
                <GoogleSignInButton />
              </div>
              <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                We use Google Sign-In to securely authenticate your account.
              </p>
            </TabsContent>

            <TabsContent value="magic" className="mt-5">
              <MagicLinkForm />
              <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                We&apos;ll send you a secure link to sign in instantly.
              </p>
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-8 border-t border-slate-200 pt-6 text-center dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              New to YourCyberWill?{" "}
              <Link
                href="/"
                className="font-semibold text-black underline-offset-4 hover:underline dark:text-white"
              >
                Learn more
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badge */}
        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400 dark:text-slate-600">
          <ShieldCheck size={14} weight="fill" />
          Protected with end-to-end encryption
        </p>
      </div>
      
      <br/>
      <br/>
      <br/>
      <Footer/>
    </div>
    
  );
}