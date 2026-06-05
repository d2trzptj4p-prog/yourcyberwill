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
    description: "If you expect to use the service for a short time",
    price: "$16",
    period: "/month",
  },
  {
    id: "yearly",
    name: "Yearly",
    description: "Best option for most individuals",
    price: "$46",
    period: "/year",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    description: "Pay once and get ease of mind",
    price: "$86",
    period: "one-time",
    highlighted: true,
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
      <section className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800">
        <p className="text-sm text-slate-500">Loading subscription…</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-slate-100 border-slate-200 p-6 dark:border-slate-800">
      <div className="flex items-center text-slate-900 dark:text-slate-100">
        <Crown className="mr-3 size-7 text-black" />
        <h2 className="text-2xl">Premium</h2>
      </div>
      {!subscription?.active && (
  <div className="mt-6 grid grid-cols-1 gap-1 text-sm sm:grid-cols-2 md:grid-cols-3">
    {[
     
  { title: "150 MB Uploads", desc: "Single file limit (vs 15 MB on Free)" },
  { title: "300 MB Total Storage", desc: "Secure cloud capacity (vs 30 MB on Free)" },
  { title: "50 Secure Passwords", desc: "Vault credentials (vs 2 on Free)" },
  { title: "50 Encrypted Notes", desc: "Text & instructions (vs 1 on Free)" },
  { title: "20 Recipients", desc: "Designated loved ones (vs 1 on Free)" }

    ].map((item, index) => (
      <div 
        key={index} 
        className="rounded-xl bg-slate-200 p-3  px-4"
      >
        <div className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</div>
        <div className="mt-1 text-xs text-slate-500">{item.desc}</div>
      </div>
    ))}
  </div>
)}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col items-start gap-3">
        {subscription?.active ? (
          <div className="flex flex-col items-start gap-3 w-full">
            <div className="flex items-center gap-3 justify-between w-full">
              <p className="rounded-lg bg-emerald-200 px-4 py-3 text-sm font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
              You have premium
            </p>
            <ManageSubscriptionButton visible />
              </div>
            
          </div>
        ) : (
          <>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`cursor-pointer rounded-2xl p-6 transition-all ${
                    selectedPlan === plan.id
                      ? "border-slate-900 outline-2 bg-white dark:border-slate-100 dark:bg-slate-900"
                      : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
                  } ${plan.highlighted ? "" : ""}`}
                >
                  {plan.highlighted && (
                    <div className="mb-3 inline-block bg-amber-100 px-3 py-1 rounded-full text-xs font-semibold text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-lg text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-4xl text-slate-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {plan.period}
                    </span>
                  </div>
                  {/* {selectedPlan === plan.id && (
                    <div className="mt-4 flex items-center text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      <Check weight="bold" className="mr-2 size-4" />
                      Selected
                    </div>
                  )} */}
                </div>
              ))}
            </div>

            <div className="w-full flex justify-end mt-6">
              <Button
                type="button"
                onClick={handleSubscribe}
                disabled={checkingOut}
                className="inline-flex h-13 items-center justify-center rounded-full bg-slate-900 px-12 text-md font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
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
