"use client";

import { useCallback, useEffect, useState } from "react";
import { useCheckInGuard } from "@/components/check-in-guard-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVault } from "@/components/vault/vault-context";
import {
  buildEncryptedPasswordPayload,
  decryptPasswordRow,
  type PasswordFormInput,
} from "@/lib/vault-password-crypto";
import { useTierLimits } from "@/lib/use-tier-limits";
import type { DecryptedPassword, VaultPasswordRow } from "@/lib/vault-types";

// --- Adjust Character Limits Here ---
const MAX_ACCOUNT_TYPE_LENGTH = 100;
const MAX_USERNAME_LENGTH = 256;
const MAX_PASSWORD_LENGTH = 2048; 

const emptyForm: PasswordFormInput = {
  account_type: "",
  username: "",
  password: "",
};

// --- In-file Helper Component for the Popup Dialog ---
function ValuePopup({
  title,
  value,
  onClose,
}: {
  title: string;
  value: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl animate-in zoom-in-95 duration-200 text-zinc-900">
        <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          {title}
        </h3>
        
        <div className="flex gap-2 items-center mt-3">
          <Input
            readOnly
            value={value}
            className="flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-400 focus-visible:ring-offset-0"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 min-w-[70px]"
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 bg-white hover:bg-zinc-50"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

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

  // Popup state management
  const [popupData, setPopupData] = useState<{ title: string; value: string } | null>(null);

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

    // Client-side validation fallback
    if (form.account_type.length > MAX_ACCOUNT_TYPE_LENGTH) {
      setError(`Account type cannot exceed ${MAX_ACCOUNT_TYPE_LENGTH} characters.`);
      return;
    }
    if (form.username.length > MAX_USERNAME_LENGTH) {
      setError(`Username cannot exceed ${MAX_USERNAME_LENGTH} characters.`);
      return;
    }
    if (form.password.length > MAX_PASSWORD_LENGTH) {
      setError(`Password/Seed Phrase cannot exceed ${MAX_PASSWORD_LENGTH} characters.`);
      return;
    }

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
    <section className="rounded-2xl border border-zinc-200 p-6 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Password manager</h2>
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
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-zinc-800"
        >
          Add password
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-zinc-900"
        >
          <h3 className="text-sm font-medium text-zinc-900">
            {editingId ? "Edit password" : "New password"}
          </h3>
          <label className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-zinc-800">Account type</span>
              <span className="text-xs text-zinc-400">
                {form.account_type.length}/{MAX_ACCOUNT_TYPE_LENGTH}
              </span>
            </div>
            <Input
              required
              maxLength={MAX_ACCOUNT_TYPE_LENGTH}
              placeholder="e.g. Banking, Netflix, Router PIN"
              value={form.account_type}
              onChange={(e) =>
                setForm((p) => ({ ...p, account_type: e.target.value }))
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-zinc-800">Username</span>
              <span className="text-xs text-zinc-400">
                {form.username.length}/{MAX_USERNAME_LENGTH}
              </span>
            </div>
            <Input
              required
              maxLength={MAX_USERNAME_LENGTH}
              value={form.username}
              onChange={(e) =>
                setForm((p) => ({ ...p, username: e.target.value }))
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-zinc-800">Password</span>
              <span className="text-xs text-zinc-400">
                {form.password.length}/{MAX_PASSWORD_LENGTH}
              </span>
            </div>
            <Input
              required
              maxLength={MAX_PASSWORD_LENGTH}
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 focus-visible:ring-1 focus-visible:ring-zinc-400"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm text-white disabled:opacity-60 hover:bg-zinc-800"
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
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 bg-white hover:bg-zinc-50"
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {loadError && <p className="mt-4 text-sm text-red-600">{loadError}</p>}

      {locked && (
        <p className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          All emails have been sent to your recipients. Vault edits are disabled.
        </p>
      )}

      {!loadError && items.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">No passwords saved yet.</p>
      )}

      {items.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[32rem] table-fixed text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-900">
                <th className="w-[25%] py-2 pr-4 font-semibold">Type</th>
                <th className="w-[30%] py-2 pr-4 font-semibold">Username</th>
                <th className="w-[25%] py-2 pr-4 font-semibold">Password</th>
                <th className="w-[20%] py-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-zinc-100 text-zinc-800 hover:bg-zinc-50/50 transition-colors"
                >
                  {/* Account Type Column */}
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => setPopupData({ title: "Account Type", value: row.account_type })}
                      className="max-w-full text-left truncate hover:underline block font-medium text-zinc-900"
                    >
                      {row.account_type}
                    </button>
                  </td>

                  {/* Username Column */}
                  <td className="py-3 pr-4 font-mono text-xs text-zinc-600">
                    <button
                      type="button"
                      onClick={() => setPopupData({ title: "Username", value: row.username })}
                      className="max-w-full text-left truncate hover:underline block"
                    >
                      {row.username}
                    </button>
                  </td>

                  {/* Password Column */}
                  <td className="py-3 pr-4 font-mono text-xs">
                    <div className="flex items-center gap-2 max-w-full">
                      {hidden.has(row.id) ? (
                        <span className="text-zinc-400">••••••••</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setPopupData({ title: "Password", value: row.password })}
                          className="truncate text-left hover:underline block max-w-[calc(100%-3rem)] text-zinc-600"
                        >
                          {row.password}
                        </button>
                      )}
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
                        className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 ml-auto shrink-0 px-2 py-1 h-auto text-xs"
                      >
                        {hidden.has(row.id) ? "View" : "Hide"}
                      </Button>
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="py-3">
                    <div className="flex gap-2">
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
                        className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 px-2 py-1 h-auto text-xs"
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        disabled={locked}
                        onClick={() => handleDelete(row.id)}
                        variant="ghost"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700 px-2 py-1 h-auto text-xs"
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

      {/* Render the modal popup dynamically when data exists */}
      {popupData && (
        <ValuePopup
          title={popupData.title}
          value={popupData.value}
          onClose={() => setPopupData(null)}
        />
      )}
    </section>
  );
}