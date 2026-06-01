"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_RECIPIENT_EMAIL_TEMPLATE,
  RECIPIENT_EMAIL_PLACEHOLDERS,
} from "@/lib/recipient-email-template";
import {
  LoadingSpinner,
  useCheckInGuard,
} from "@/components/check-in-guard-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useVault } from "@/components/vault/vault-context";
import { CHECK_IN_FIRST_MESSAGE } from "@/lib/check-in-edit-block";
import { type Recipient, recipientHasVaultLink } from "@/lib/check-in-types";
import { useTierLimits } from "@/lib/use-tier-limits";
import { ClockCountdownIcon, EnvelopeOpenIcon, UsersFour } from "@phosphor-icons/react";
import { toast } from "sonner"

function formatCountdown(ms: number): string {
  if (ms <= 0) {
    return "Overdue";
  }
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  parts.push(
    `${hours.toString().padStart(2, "0")}h`,
    `${minutes.toString().padStart(2, "0")}m`,
    `${seconds.toString().padStart(2, "0")}s`,
  );
  return parts.join(" ");
}

const emptyRecipientForm = { name: "", email: "" };

export function CheckInSection() {
  const {
    checkIn,
    remainingMs,
    editBlocked,
    guardEdit,
    refreshCheckIn,
  } = useCheckInGuard();
  const {
    unlocked,
    syncRecipientAccess,
    releaseAccessWarning,
    recipientLinksVersion,
    syncingRecipientLinks,
  } = useVault();
  const { tier, refresh: refreshTier } = useTierLimits();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [form, setForm] = useState(emptyRecipientForm);
  const [emailTemplate, setEmailTemplate] = useState(
    DEFAULT_RECIPIENT_EMAIL_TEMPLATE,
  );
  const [showForm, setShowForm] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [encryptingNewRecipients, setEncryptingNewRecipients] = useState<
    number | null
  >(null);

  const locked = checkIn?.recipients_notified_complete === true;

  const load = useCallback(async () => {
    setError(null);
    try {
      const [recipientsRes, checkInState] = await Promise.all([
        fetch("/api/recipients"),
        refreshCheckIn(),
      ]);
      if (!recipientsRes.ok) {
        throw new Error("Failed to load check-in data");
      }
      setRecipients((await recipientsRes.json()) as Recipient[]);
      setEmailTemplate(
        checkInState?.recipient_email_template ??
          DEFAULT_RECIPIENT_EMAIL_TEMPLATE,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [refreshCheckIn]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (recipientLinksVersion > 0) {
      load();
    }
  }, [recipientLinksVersion, load]);

  useEffect(() => {
    if (checkIn?.recipient_email_template) {
      setEmailTemplate(checkIn.recipient_email_template);
    }
  }, [checkIn?.recipient_email_template]);

  async function handleAddRecipient(event: React.FormEvent) {
    event.preventDefault();
    guardEdit(async () => {
      setError(null);
      setSaving(true);
      try {
        const response = await fetch("/api/recipients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Failed to add recipient");
        }
        setForm(emptyRecipientForm);
        setShowForm(false);
        if (unlocked) {
          setEncryptingNewRecipients(1);
        }
        try {
          await load();
          await refreshTier();
          if (unlocked) {
            await syncRecipientAccess();
            await load();
          }
        } finally {
          setEncryptingNewRecipients(null);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add");
      } finally {
        setSaving(false);
      }
    });
  }

  const atRecipientLimit =
    tier !== null && tier.usage.recipients >= tier.limits.maxRecipients;

  const recipientsNeedingLinks = recipients.filter(
    (r) => !r.notified_at && !recipientHasVaultLink(r),
  );
  const allRecipientLinksReady =
    recipients.length > 0 && recipientsNeedingLinks.length === 0;

  const encryptingLinks =
    syncingRecipientLinks || encryptingNewRecipients !== null;

  const encryptingMessage =
    encryptingNewRecipients === 1
      ? "Encrypting vault access for new recipient…"
      : encryptingNewRecipients !== null && encryptingNewRecipients > 1
        ? `Encrypting vault access for ${encryptingNewRecipients} new recipients…`
        : "Encrypting vault access for recipients…";

  async function handleRetryRecipientLinks() {
    setError(null);
    setEncryptingNewRecipients(recipientsNeedingLinks.length);
    try {
      await syncRecipientAccess();
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not encrypt recipient links",
      );
    } finally {
      setEncryptingNewRecipients(null);
    }
  }

  async function handleDeleteRecipient(id: string) {
    guardEdit(async () => {
      setError(null);
      try {
        const response = await fetch(`/api/recipients/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Failed to remove recipient");
        }
        await load();
        await refreshTier();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to remove");
      }
    });
  }

  async function handleSaveTemplate() {
    guardEdit(async () => {
      setError(null);
      setSavingTemplate(true);
      try {
        const response = await fetch("/api/check-in/email-template", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ template: emailTemplate }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Failed to save template");
        }
        setShowTemplateEditor(false);
        await refreshCheckIn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save template");
      } finally {
        setSavingTemplate(false);
      }
    });
  }

  async function handleCheckIn() {
    if (firstStartVaultBlocked) {
      setError(
        "Unlock your vault or create a vault password before starting check-ins.",
      );
      return;
    }

    setError(null);
    setCheckingIn(true);
    try {
      const response = await fetch("/api/check-in", { method: "POST" });
      if (!response.ok) {
        const data = await response.json();
          toast.error(data.error ?? "Check-in failed");
        throw new Error(data.error ?? "Check-in failed");
      }
      await refreshCheckIn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Check-in failed");
    } finally {
      setCheckingIn(false);
    }
  }

  const recipientCount = checkIn?.recipient_count ?? recipients.length;
  const isFirstStart = !checkIn?.active;
  const firstStartVaultBlocked = isFirstStart && !unlocked;
  const canStartOrCheckIn =
    recipientCount >= 1 && !locked && !firstStartVaultBlocked;
  const buttonLabel = isFirstStart ? "Start check-ins" : "Check in";

  if (loading) {
    return (
      <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <p className="text-sm text-zinc-500">Loading check-ins…</p>
      </section>
    );
  }

  if (locked) {
    return (
      <section className="space-y-4 rounded-2xl border border-zinc-200 mb-8 p-6 opacity-75 dark:border-zinc-800">
        <h2 className="text-lg font-medium text-zinc-500">Check-ins</h2>
        <p className="rounded-xl bg-zinc-100 px-4 py-4 text-sm font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          All emails have been sent to your recipients. Check-ins and recipient
          management are no longer available for this account.
        </p>
        {recipients.length > 0 && (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
            {recipients.map((r) => (
              <li key={r.id} className="px-4 py-3">
                <p className="font-medium text-zinc-500">{r.name}</p>
                <p className="text-sm text-zinc-400">{r.email}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <section className="space-y-6 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <div>
        <h2 className="text-2xl">Check-ins</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Add the email of your beneficiaries. If you fail to check in before the deadline, we will send your beneficiaries an email with a link to access your encrypted vault.
        </p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
          {error}
        </p>
      )}

      {editBlocked && checkIn?.active && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          {CHECK_IN_FIRST_MESSAGE}
        </p>
      )}

      {releaseAccessWarning && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          {releaseAccessWarning}
        </p>
      )}

      {encryptingLinks && (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300">
          <LoadingSpinner className="size-5 shrink-0 text-zinc-500" />
          <p>{encryptingMessage}</p>
        </div>
      )}

      {!encryptingLinks && recipientsNeedingLinks.length > 0 && !unlocked && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          Unlock your vault below so we can encrypt view-only access links for
          your recipients.
        </p>
      )}

      {!encryptingLinks &&
        recipientsNeedingLinks.length > 0 &&
        unlocked && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <p className="font-medium">Could not encrypt recipient links</p>
            <Button
              type="button"
              onClick={handleRetryRecipientLinks}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-full bg-amber-800 px-4 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-200 dark:text-amber-950"
            >
              Retry encrypting links
            </Button>
          </div>
        )}

      {!encryptingLinks &&
        allRecipientLinksReady &&
        recipients.some((r) => !r.notified_at) && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
            Recipient vault links are ready for notification emails.
          </p>
        )}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Recipient email message
          </h3>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowTemplateEditor((v) => !v)}
            className="text-lg font-medium text-zinc-600 underline-offset-2 hover:underline dark:text-zinc-400"
          >
            <EnvelopeOpenIcon className="size-6" />
            {showTemplateEditor ? "Hide" : "Customize"}
          </Button>
        </div>
        {showTemplateEditor ? (
          <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <Textarea
              value={emailTemplate}
              onChange={(e) => setEmailTemplate(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-900"
            />
            <p className="text-xs text-zinc-500">
              Placeholders: {RECIPIENT_EMAIL_PLACEHOLDERS.join(", ")}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleSaveTemplate}
                disabled={savingTemplate}
                className="h-9 rounded-full bg-zinc-900 px-4 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {savingTemplate ? "Saving…" : "Save message"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEmailTemplate(
                    checkIn?.recipient_email_template ??
                      DEFAULT_RECIPIENT_EMAIL_TEMPLATE,
                  );
                  setShowTemplateEditor(false);
                }}
                className="h-9 text-sm text-zinc-600 hover:underline dark:text-zinc-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Change the boilerplate email that your recipients will receive when they get notified. 
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
            Recipients
            {tier && (
              <span className="ml-2 font-normal text-zinc-500">
                ({tier.usage.recipients} / {tier.limits.maxRecipients}{" "}
                {tier.tier})
              </span>
            )}
          </h3>
          <Button
            type="button"
            variant="ghost"
            disabled={atRecipientLimit}
            onClick={() => setShowForm((v) => !v)}
            className="text-lg font-medium text-zinc-600 underline-offset-2 hover:underline disabled:opacity-40 dark:text-zinc-400"
          >
            <UsersFour className="size-6"/>
            {showForm ? "Cancel" : "Add recipient"}
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAddRecipient}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-700"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Name</span>
                <Input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
                  placeholder="Jane Doe"
                />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Email</span>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-600 dark:bg-zinc-900"
                placeholder="jane@example.com"
              />
            </label>
            <Button
              type="submit"
              disabled={saving}
              className="h-10 rounded-full bg-zinc-900 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {saving ? "Saving…" : "Save recipient"}
            </Button>
          </form>
        )}

        {recipients.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No recipients yet. Add at least one to start check-ins.
          </p>
        ) : (
          <>
            {recipients.length === 1 && (
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You must keep at least one recipient. Remove is disabled until you
                add another recipient.
              </p>
            )}
            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-700 dark:border-zinc-700">
              {recipients.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {r.name}
                    </p>
                    <p className="text-sm text-zinc-500">{r.email}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={recipients.length === 1}
                    onClick={() => handleDeleteRecipient(r.id)}
                    className="text-sm text-red-600 hover:underline dark:text-red-400 disabled:text-zinc-400 disabled:hover:underline-none"
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className="flex flex-col items-start gap-4 border-t border-zinc-200 pt-6 dark:border-zinc-700">
        {checkIn?.active && checkIn.due_at && remainingMs !== null && (
          <div className="w-full rounded-xl bg-zinc-50 px-4 py-4 text-center dark:bg-zinc-900">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Time until check-in due
            </p>
            <p
              className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${
                remainingMs <= 0
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-900 dark:text-zinc-100"
              }`}
            >
              {formatCountdown(remainingMs)}
            </p>
          </div>
        )}

        <Button
          type="button"
          onClick={handleCheckIn}
          disabled={!canStartOrCheckIn || checkingIn}
          title={
            !canStartOrCheckIn
              ? recipientCount < 1
                ? "Add at least one recipient first"
                : firstStartVaultBlocked
                ? "Unlock or create your vault before starting check-ins"
                : undefined
              : undefined
          }
          className="inline-flex h-14 items-center justify-center rounded-full px-8 text-lg font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ClockCountdownIcon weight="fill" className="size-6 mr-1" />
          {checkingIn ? "Saving…" : buttonLabel}
        </Button>

        {!canStartOrCheckIn && recipientCount < 1 && (
          <p className="text-xs text-zinc-500">
            Add at least one recipient to enable check-ins.
          </p>
        )}
        {!canStartOrCheckIn && firstStartVaultBlocked && (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Unlock your vault or create a vault password before starting check-ins.
          </p>
        )}
      </div>
    </section>
  );
}
