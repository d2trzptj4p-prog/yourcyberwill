"use client";

import { ManageSubscriptionButton } from "@/components/manage-subscription-button";
import { useCallback, useEffect, useState } from "react";
import type { SubscriptionState } from "@/lib/check-in-types";
import { Button } from "@/components/ui/button";
import { Crown, CrownCross } from "@phosphor-icons/react";

export function SubscriptionSection() {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/subscription");
      if (!response.ok) {
        throw new Error("Failed to load subscription");
      }
      setSubscription((await response.json()) as SubscriptionState);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onTierUpdated = () => {
      load();
    };
    window.addEventListener("tier-updated", onTierUpdated);
    return () => window.removeEventListener("tier-updated", onTierUpdated);
  }, [load]);

  async function handleSubscribe() {
    setError(null);
    setCheckingOut(true);
    try {
      const response = await fetch("/api/polar/checkout", {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Checkout failed");
      }
      window.location.href = data.url as string;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setCheckingOut(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">Loading subscription…</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-gray-100 border-zinc-200 p-6 dark:border-zinc-800">
      <div className="flex items-center text-zinc-900 dark:text-zinc-100">
        
      <Crown className="mr-3 size-7 text-black" />
      <h2 className="text-2xl">Go Premium</h2>
      </div>
     <ol className="mt-4 list-inside list-disc space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
  <li><strong>250 MB</strong> single file uploads <span className="text-xs text-zinc-500">(vs 15 MB on Free)</span></li>
  <li><strong>2 GB</strong> total secure storage <span className="text-xs text-zinc-500">(vs 50 MB on Free)</span></li>
  <li>Up to <strong>50 secure passwords</strong> stored <span className="text-xs text-zinc-500">(vs 3 on Free)</span></li>
  <li>Up to <strong>50 encrypted notes</strong> <span className="text-xs text-zinc-500">(vs 1 on Free)</span></li>
  <li>Up to <strong>20 designated recipients</strong> <span className="text-xs text-zinc-500">(vs 2 on Free)</span></li>
</ol>
      

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col items-start gap-3">
        {subscription?.active ? (
          <div className="flex flex-col items-start gap-3">
            <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              Subscription validated — you&apos;re on Premium.
            </p>
            <ManageSubscriptionButton visible />
          </div>
        ) : (
          <div className="flex w-full justify-end">
            <Button
              type="button"
              onClick={handleSubscribe}
              disabled={checkingOut}
              className="inline-flex h-13 items-center justify-center rounded-full bg-zinc-900 px-12 text-md font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
            >
              {checkingOut ? "Redirecting…" : "Choose a plan"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
