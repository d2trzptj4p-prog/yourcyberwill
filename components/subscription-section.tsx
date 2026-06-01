"use client";

import { ManageSubscriptionButton } from "@/components/manage-subscription-button";
import { useCallback, useEffect, useState } from "react";
import type { SubscriptionState } from "@/lib/check-in-types";
import { Button } from "@/components/ui/button";
import { Crown, CrownCross, Check } from "@phosphor-icons/react";

type PlanType = "monthly" | "yearly" | "lifetime";

interface Plan {
  id: PlanType;
  name: string;
  description: string;
  price: string;
  period: string;
  highlighted?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Monthly",
    description: "Billed monthly, cancel anytime",
    price: "$9.99",
    period: "/month",
  },
  {
    id: "yearly",
    name: "Yearly",
    description: "Save 2 months vs monthly",
    price: "$99.99",
    period: "/year",
    highlighted: true,
  },
  {
    id: "lifetime",
    name: "Lifetime",
    description: "One-time purchase, forever access",
    price: "$299",
    period: "one-time",
  },
];

export function SubscriptionSection() {
  const [subscription, setSubscription] = useState<SubscriptionState | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("yearly");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: selectedPlan }),
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
        <li>
          <strong>250 MB</strong> single file uploads{" "}
          <span className="text-xs text-zinc-500">(vs 15 MB on Free)</span>
        </li>
        <li>
          <strong>2 GB</strong> total secure storage{" "}
          <span className="text-xs text-zinc-500">(vs 50 MB on Free)</span>
        </li>
        <li>
          Up to <strong>50 secure passwords</strong> stored{" "}
          <span className="text-xs text-zinc-500">(vs 3 on Free)</span>
        </li>
        <li>
          Up to <strong>50 encrypted notes</strong>{" "}
          <span className="text-xs text-zinc-500">(vs 1 on Free)</span>
        </li>
        <li>
          Up to <strong>20 designated recipients</strong>{" "}
          <span className="text-xs text-zinc-500">(vs 2 on Free)</span>
        </li>
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
          <>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`cursor-pointer rounded-2xl border-2 p-6 transition-all ${
                    selectedPlan === plan.id
                      ? "border-zinc-900 bg-white dark:border-zinc-100 dark:bg-zinc-900"
                      : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950"
                  } ${plan.highlighted ? "ring-2 ring-yellow-400 ring-offset-2 dark:ring-offset-zinc-950" : ""}`}
                >
                  {plan.highlighted && (
                    <div className="mb-3 inline-block bg-yellow-100 px-3 py-1 rounded-full text-xs font-semibold text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                      {plan.period}
                    </span>
                  </div>
                  {selectedPlan === plan.id && (
                    <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <Check weight="bold" className="mr-2 size-4" />
                      Selected
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="w-full flex justify-end mt-6">
              <Button
                type="button"
                onClick={handleSubscribe}
                disabled={checkingOut}
                className="inline-flex h-13 items-center justify-center rounded-full bg-zinc-900 px-12 text-md font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
              >
                {checkingOut ? "Redirecting…" : "Choose Plan"}
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
