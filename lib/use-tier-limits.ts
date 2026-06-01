"use client";

import { useCallback, useEffect, useState } from "react";
import type { TierLimitsResponse } from "@/lib/tier-types";

export function useTierLimits() {
  const [tier, setTier] = useState<TierLimitsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/tier/limits");
      if (response.ok) {
        setTier((await response.json()) as TierLimitsResponse);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onTierUpdated = () => {
      refresh();
    };
    window.addEventListener("tier-updated", onTierUpdated);
    return () => window.removeEventListener("tier-updated", onTierUpdated);
  }, [refresh]);

  return { tier, loading, refresh };
}
