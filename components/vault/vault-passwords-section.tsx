"use client";

import { useCallback, useEffect, useState } from "react";
import { useCheckInGuard } from "@/components/check-in-guard-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useVault } from "@/components/vault/vault-context";
import {
  buildEncryptedPasswordPayload,
  decryptPasswordRow,
  type PasswordFormInput,
} from "@/lib/vault-password-crypto";
import { useTierLimits } from "@/lib/use-tier-limits";
import type { DecryptedPassword, VaultPasswordRow } from "@/lib/vault-types";

const ACCOUNT_TYPES = [
  "Google",
  "Netflix",
  "Banking",
  "Email",
  "Social",
  "Work",
  "Other",
] as const;

const emptyForm: PasswordFormInput = {
  account_type: "Google",
  username: "",
  password: "",
};

export function VaultPasswordsSection() {
  const { guardEdit, checkIn } = useCheckInGuard();
  const locked = checkIn?.recipients_notified_complete === true;
  const { withKey, refreshUnlocked } = useVault();
  const { tier, refresh: refreshTier } = useTierLimits();
  const [items, setItems] = useState<DecryptedPassword[]>([]);
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const response = await fetch("/api/vault/passwords");
      if (!response.ok) {
        throw new Error("Failed to load passwords");
      }
      const rows = (await response.json()) as VaultPasswordRow[];
      const decrypted = await withKey(async (key) =>
        Promise.all(rows.map((row) => decryptPasswordRow(row, key))),
      );
      setItems(decrypted);
      setHidden(new Set(decrypted.map((row) => row.id)));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [withKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    guardEdit(async () => {
      setError(null);
      setSaving(true);
      try {
        const payload = await withKey((key) =>
          buildEncryptedPasswordPayload(form, key),
        );
        const url = editingId
          ? `/api/vault/passwords/${editingId}`
          : "/api/vault/passwords";
        const response = await fetch(url, {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Save failed");
        }
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        await load();
        await refreshTier();
        await refreshUnlocked();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      } finally {
        setSaving(false);
      }
    });
  }

  const atPasswordLimit =
    tier !== null &&
    !editingId &&
    tier.usage.passwords >= tier.limits.maxPasswords;

  async function handleDelete(id: string) {
    if (!confirm("Delete this password entry?")) {
      return;
    }
    guardEdit(async () => {
      await fetch(`/api/vault/passwords/${id}`, { method: "DELETE" });
      await load();
      await refreshTier();
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Password manager</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Account type, username, and password only — all encrypted.
            {tier && (
              <>
                {" "}
                {tier.usage.passwords} / {tier.limits.maxPasswords} on{" "}
                {tier.tier} plan.
              </>
            )}
          </p>
        </div>
        <Button
          type="button"
          disabled={atPasswordLimit || locked}
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add password
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <h3 className="text-sm font-medium">
            {editingId ? "Edit password" : "New password"}
          </h3>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Account type</span>
            <NativeSelect
              value={form.account_type}
              onChange={(e) =>
                setForm((p) => ({ ...p, account_type: e.target.value }))
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </NativeSelect>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Username</span>
            <Input
              required
              value={form.username}
              onChange={(e) =>
                setForm((p) => ({ ...p, username: e.target.value }))
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Password</span>
            <Input
              required
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
            <Button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              variant="outline"
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loadError && <p className="mt-4 text-sm text-red-600">{loadError}</p>}

      {locked && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          All emails have been sent to your recipients. Vault edits are disabled.
        </p>
      )}

      {!loadError && items.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">No passwords saved yet.</p>
      )}

      {items.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Username</th>
                <th className="py-2 pr-4 font-medium">Password</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-100 dark:border-zinc-900"
                >
                  <td className="py-3 pr-4">{row.account_type}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{row.username}</td>
                  <td className="py-3 pr-4 font-mono text-xs">
                    {hidden.has(row.id) ? "••••••••" : row.password}
                    <Button
                      type="button"
                      onClick={() =>
                        setHidden((prev) => {
                          const next = new Set(prev);
                          if (next.has(row.id)) next.delete(row.id);
                          else next.add(row.id);
                          return next;
                        })
                      }
                      variant="ghost"
                      className="ml-2 text-zinc-500 underline"
                    >
                      {hidden.has(row.id) ? "View" : "Hide"}
                    </Button>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        disabled={locked}
                        onClick={() => {
                          setEditingId(row.id);
                          setForm({
                            account_type: row.account_type,
                            username: row.username,
                            password: row.password,
                          });
                          setShowForm(true);
                        }}
                        variant="ghost"
                        className="text-zinc-600 hover:underline dark:text-zinc-400"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        disabled={locked}
                        onClick={() => handleDelete(row.id)}
                        variant="ghost"
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
