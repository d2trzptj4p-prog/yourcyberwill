"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import {
  CHECK_IN_COMPLETE_MESSAGE,
  CHECK_IN_FIRST_MESSAGE,
  isCheckInEditBlocked,
} from "@/lib/check-in-edit-block";
import type { CheckInState } from "@/lib/check-in-types";
import { toast } from "sonner"

type CheckInGuardContextValue = {
  checkIn: CheckInState | null;
  remainingMs: number | null;
  editBlocked: boolean;
  guardEdit: (run: () => void | Promise<void>) => void;
  refreshCheckIn: () => Promise<CheckInState | null>;
  performCheckIn: () => Promise<void>;
  checkingInFromModal: boolean;
};

const CheckInGuardContext = createContext<CheckInGuardContextValue | null>(
  null,
);

export function useCheckInGuard() {
  const ctx = useContext(CheckInGuardContext);
  if (!ctx) {
    throw new Error("useCheckInGuard must be used within CheckInGuardProvider");
  }
  return ctx;
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className ?? ""}`}
      aria-hidden
    />
  );
}

export function CheckInGuardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [checkIn, setCheckIn] = useState<CheckInState | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [checkingInFromModal, setCheckingInFromModal] = useState(false);

  const refreshCheckIn = useCallback(async () => {
    const response = await fetch("/api/check-in");
    if (!response.ok) {
      return null;
    }
    const state = (await response.json()) as CheckInState;
    setCheckIn(state);
    return state;
  }, []);

  useEffect(() => {
    refreshCheckIn();
  }, [refreshCheckIn]);

  useEffect(() => {
    if (!checkIn?.active || !checkIn.due_at || checkIn.recipients_notified_complete) {
      setRemainingMs(null);
      return;
    }

    function tick() {
      setRemainingMs(new Date(checkIn!.due_at!).getTime() - Date.now());
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [checkIn?.active, checkIn?.due_at, checkIn?.recipients_notified_complete]);

  const editBlocked = useMemo(
    () => isCheckInEditBlocked(checkIn, remainingMs),
    [checkIn, remainingMs],
  );

  const lockMessage = checkIn?.recipients_notified_complete
    ? CHECK_IN_COMPLETE_MESSAGE
    : CHECK_IN_FIRST_MESSAGE;

  const guardEdit = useCallback(
    (run: () => void | Promise<void>) => {
      if (isCheckInEditBlocked(checkIn, remainingMs)) {
        setModalOpen(true);
        return;
      }
      void run();
    },
    [checkIn, remainingMs],
  );

  const performCheckIn = useCallback(async () => {
    setCheckingInFromModal(true);
    try {
      const response = await fetch("/api/check-in", { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
        toast.error(data.error ?? "Check-in failed");
        throw new Error(data.error ?? "Check-in failed");
      }
      setCheckIn((await response.json()) as CheckInState);
      setModalOpen(false);
    } finally {
      setCheckingInFromModal(false);
    }
  }, []);

  return (
    <CheckInGuardContext.Provider
      value={{
        checkIn,
        remainingMs,
        editBlocked,
        guardEdit,
        refreshCheckIn,
        performCheckIn,
        checkingInFromModal,
      }}
    >
      {children}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="check-in-required-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h2
              id="check-in-required-title"
              className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
            >
              {checkIn?.recipients_notified_complete ? "Action not allowed" : "Check in first"}
            </h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {lockMessage}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {checkIn?.recipients_notified_complete ? (
                <Button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  variant="outline"
                  className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium dark:border-zinc-600"
                >
                  OK
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={() => void performCheckIn()}
                    disabled={checkingInFromModal}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    {checkingInFromModal && <LoadingSpinner />}
                    {checkingInFromModal ? "Checking in…" : "Check in now"}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    variant="outline"
                    className="inline-flex h-10 items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium dark:border-zinc-600"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </CheckInGuardContext.Provider>
  );
}

export { LoadingSpinner };
