"use client";

import { useCallback, useEffect, useState } from "react";
import { VaultMarkdown } from "@/components/vault-markdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCheckInGuard } from "@/components/check-in-guard-provider";
import { useVault } from "@/components/vault/vault-context";
import {
  buildEncryptedNotePayload,
  decryptNoteRow,
  type NoteFormInput,
} from "@/lib/vault-note-crypto";
import { useTierLimits } from "@/lib/use-tier-limits";
import type { DecryptedNote, VaultNoteRow } from "@/lib/vault-types";

const emptyForm: NoteFormInput = { title: "", body: "" };

export function VaultNotesSection() {
  const { guardEdit, checkIn } = useCheckInGuard();
  const locked = checkIn?.recipients_notified_complete === true;
  const { withKey, refreshUnlocked } = useVault();
  const { tier, refresh: refreshTier } = useTierLimits();
  const [items, setItems] = useState<DecryptedNote[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const response = await fetch("/api/vault/notes");
      if (!response.ok) {
        throw new Error("Failed to load notes");
      }
      const rows = (await response.json()) as VaultNoteRow[];
      const decrypted = await withKey(async (key) =>
        Promise.all(rows.map((row) => decryptNoteRow(row, key))),
      );
      setItems(decrypted);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [withKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    guardEdit(async () => {
      setError(null);
      setSaving(true);
      try {
        const payload = await withKey((key) =>
          buildEncryptedNotePayload(form, key),
        );
        const url = editingId
          ? `/api/vault/notes/${editingId}`
          : "/api/vault/notes";
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

  const atNoteLimit =
    tier !== null && !editingId && tier.usage.notes >= tier.limits.maxNotes;

  async function handleDelete(id: string) {
    if (!confirm("Delete this note?")) {
      return;
    }
    guardEdit(async () => {
      await fetch(`/api/vault/notes/${id}`, { method: "DELETE" });
      if (expandedId === id) {
        setExpandedId(null);
      }
      await load();
      await refreshTier();
    });
  }

  return (
    <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium">Notes</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Markdown notes — title and body encrypted separately.
            {tier && (
              <>
                {" "}
                {tier.usage.notes} / {tier.limits.maxNotes} on {tier.tier} plan.
              </>
            )}
          </p>
        </div>
        <Button
          type="button"
          disabled={atNoteLimit || locked}
          onClick={() => {
            setEditingId(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add note
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
        >
          <h3 className="text-sm font-medium">
            {editingId ? "Edit note" : "New note"}
          </h3>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Title</span>
            <Input
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Body (Markdown)</span>
            <Textarea
              rows={8}
              value={form.body}
              onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
              placeholder="**Bold**, lists, links…"
              className="rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
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
        <p className="mt-4 text-sm text-zinc-500">No notes saved yet.</p>
      )}

      <ul className="mt-4 space-y-2">
        {items.map((note) => {
          const open = expandedId === note.id;
          return (
            <li
              key={note.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <Button
                  type="button"
                  onClick={() => setExpandedId(open ? null : note.id)}
                  variant="ghost"
                  className="text-left font-medium hover:underline"
                >
                  {note.title}
                </Button>
                <div className="flex gap-3 text-sm">
                  <Button
                    type="button"
                    onClick={() => setExpandedId(open ? null : note.id)}
                    variant="ghost"
                    className="text-zinc-500 hover:underline"
                  >
                    {open ? "Hide" : "View"}
                  </Button>
                  <Button
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      setEditingId(note.id);
                      setForm({ title: note.title, body: note.body });
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
                    onClick={() => handleDelete(note.id)}
                    variant="ghost"
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </Button>
                </div>
              </div>
              {open && (
                <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
                  <VaultMarkdown content={note.body} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
