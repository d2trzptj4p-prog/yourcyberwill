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

// --- Adjust Character Limits Here ---
const MAX_NOTE_TITLE_LENGTH = 150;
const MAX_NOTE_BODY_LENGTH = 50000;

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
  
  // Tab state for the live Markdown editor preview
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write");

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
    
    // Safety check constraints
    if (form.title.length > MAX_NOTE_TITLE_LENGTH) {
      setError(`Title cannot exceed ${MAX_NOTE_TITLE_LENGTH} characters.`);
      return;
    }
    if (form.body.length > MAX_NOTE_BODY_LENGTH) {
      setError(`Body cannot exceed ${MAX_NOTE_BODY_LENGTH} characters.`);
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
        setEditorTab("write");
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
    <section className="rounded-2xl border border-slate-200 p-6 bg-white">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Notes</h2>
          <p className="mt-1 text-sm text-slate-500">
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
            setEditorTab("write");
            setShowForm(true);
          }}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-slate-800"
        >
          Add note
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
        >
          <h3 className="text-sm font-medium text-slate-900">
            {editingId ? "Edit note" : "New note"}
          </h3>
          
          {/* Title Field */}
          <label className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium text-slate-800">Title</span>
              <span className="text-xs text-slate-400">
                {form.title.length}/{MAX_NOTE_TITLE_LENGTH}
              </span>
            </div>
            <Input
              required
              maxLength={MAX_NOTE_TITLE_LENGTH}
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus-visible:ring-1 focus-visible:ring-slate-400"
            />
          </label>

          {/* Tabbed Markdown Editor */}
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between items-center border-b border-slate-200 pb-1">
              <div className="flex gap-1 bg-slate-200/60 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setEditorTab("write")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    editorTab === "write"
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    editorTab === "preview"
                      ? "bg-white shadow-sm text-slate-900"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Preview
                </button>
              </div>
              <span className="text-xs text-slate-400">
                {form.body.length.toLocaleString()}/{MAX_NOTE_BODY_LENGTH.toLocaleString()}
              </span>
            </div>

            <div className="mt-2">
              {editorTab === "write" ? (
                <Textarea
                  rows={10}
                  maxLength={MAX_NOTE_BODY_LENGTH}
                  value={form.body}
                  onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
                  placeholder="Type your notes using Markdown formatting (**bold**, # headers, * lists...)"
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm text-slate-900 focus-visible:ring-1 focus-visible:ring-slate-400"
                />
              ) : (
                <div className="min-h-[210px] max-h-[400px] overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 text-slate-900 prose prose-zinc max-w-none">
                  {form.body.trim() ? (
                    <VaultMarkdown content={form.body} />
                  ) : (
                    <p className="text-sm text-slate-400 italic">Nothing to preview yet...</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          
          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-60 hover:bg-slate-800"
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
              className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 bg-white hover:bg-slate-50"
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
        <p className="mt-4 text-sm text-slate-500">No notes saved yet.</p>
      )}

      <ul className="mt-4 space-y-2">
        {items.map((note) => {
          const open = expandedId === note.id;
          return (
            <li
              key={note.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-50/50">
                <Button
                  type="button"
                  onClick={() => setExpandedId(open ? null : note.id)}
                  variant="ghost"
                  className="text-slate-900 font-medium hover:bg-slate-100"
                >
                  Note "{note.title}"
                </Button>
                <div className="flex gap-3 text-sm">
                  <Button
                    type="button"
                    onClick={() => setExpandedId(open ? null : note.id)}
                    variant="ghost"
                    className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    {open ? "Hide" : "View"}
                  </Button>
                  <Button
                    type="button"
                    disabled={locked}
                    onClick={() => {
                      setEditingId(note.id);
                      setForm({ title: note.title, body: note.body });
                      setEditorTab("write");
                      setShowForm(true);
                    }}
                    variant="ghost"
                    className="text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    disabled={locked}
                    onClick={() => handleDelete(note.id)}
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
              {open && (
                <div className="border-t border-slate-200 px-4 py-3 bg-white text-slate-900 prose prose-zinc max-w-none">
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