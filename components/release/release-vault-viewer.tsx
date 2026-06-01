"use client";

import { useCallback, useEffect, useState } from "react";
import { VaultAttachment } from "@/components/vault-attachment";
import { VaultMarkdown } from "@/components/vault-markdown";
import { unwrapVaultKeyFromRelease } from "@/lib/vault-release-crypto";
import { decryptFileRow } from "@/lib/vault-file-crypto";
import { base64ToBytes } from "@/lib/crypto/vault-crypto";
import { decryptNoteRow } from "@/lib/vault-note-crypto";
import { decryptPasswordRow } from "@/lib/vault-password-crypto";
import type {
  DecryptedFile,
  DecryptedNote,
  DecryptedPassword,
  VaultFileRow,
  VaultNoteRow,
  VaultPasswordRow,
} from "@/lib/vault-types";
import { Button } from "@/components/ui/button";

type ReleaseVaultPayload = {
  recipient_name: string;
  owner_name: string;
  wrapped_vault_key: string;
  wrapped_vault_key_iv: string;
  passwords: VaultPasswordRow[];
  notes: VaultNoteRow[];
  files: VaultFileRow[];
};

export function ReleaseVaultViewer({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [passwords, setPasswords] = useState<DecryptedPassword[]>([]);
  const [notes, setNotes] = useState<DecryptedNote[]>([]);
  const [files, setFiles] = useState<DecryptedFile[]>([]);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [hiddenPasswords, setHiddenPasswords] = useState<Set<string>>(
    () => new Set(),
  );

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(
        `/api/release/${encodeURIComponent(token)}`,
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "This release link is not valid");
      }

      const payload = (await response.json()) as ReleaseVaultPayload;
      setOwnerName(payload.owner_name);

      const vaultKey = await unwrapVaultKeyFromRelease(
        payload.wrapped_vault_key,
        payload.wrapped_vault_key_iv,
        token,
      );

      const decryptedPasswords = await Promise.all(
        payload.passwords.map((row) => decryptPasswordRow(row, vaultKey)),
      );
      setPasswords(decryptedPasswords);
      setHiddenPasswords(new Set(decryptedPasswords.map((p) => p.id)));

      const decryptedNotes = await Promise.all(
        payload.notes.map((row) => decryptNoteRow(row, vaultKey)),
      );
      setNotes(decryptedNotes);

      const decryptedFiles: DecryptedFile[] = [];
      for (const row of payload.files) {
        const fileRes = await fetch(
          `/api/release/${encodeURIComponent(token)}/files/${row.id}`,
        );
        if (!fileRes.ok) {
          throw new Error("Failed to load an encrypted file");
        }
        const { ciphertext_base64 } = (await fileRes.json()) as {
          ciphertext_base64: string;
        };
        const encryptedBytes = base64ToBytes(ciphertext_base64);
        decryptedFiles.push(
          await decryptFileRow(row, encryptedBytes, vaultKey),
        );
      }
      setFiles(decryptedFiles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open vault");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-zinc-500">Decrypting vault…</p>;
  }

  if (error) {
    return (
      <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        View-only access to <strong>{ownerName}</strong>&apos;s vault. You
        cannot edit or download account changes from here.
      </p>

      <section className="space-y-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-medium">Passwords</h2>
        {passwords.length === 0 ? (
          <p className="text-sm text-zinc-500">No passwords stored.</p>
        ) : (
          <ul className="space-y-2">
            {passwords.map((item) => {
              const hidden = hiddenPasswords.has(item.id);
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-zinc-200 px-4 py-3 dark:border-zinc-800"
                >
                  <p className="font-medium">{item.account_type}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {item.username}
                  </p>
                  <p className="mt-1 font-mono text-sm">
                    {hidden ? "••••••••" : item.password}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    className="mt-2 text-xs text-zinc-500 hover:underline"
                    onClick={() =>
                      setHiddenPasswords((prev) => {
                        const next = new Set(prev);
                        if (next.has(item.id)) {
                          next.delete(item.id);
                        } else {
                          next.add(item.id);
                        }
                        return next;
                      })
                    }
                  >
                    {hidden ? "Show" : "Hide"} password
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-medium">Notes</h2>
        {notes.length === 0 ? (
          <p className="text-sm text-zinc-500">No notes stored.</p>
        ) : (
          <ul className="space-y-2">
            {notes.map((note) => {
              const open = expandedNoteId === note.id;
              return (
                <li
                  key={note.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
                    onClick={() =>
                      setExpandedNoteId(open ? null : note.id)
                    }
                  >
                    {note.title}
                    <span className="text-zinc-500">{open ? "−" : "+"}</span>
                  </Button>
                  {open && (
                    <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
                      <VaultMarkdown content={note.body} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-medium">Files</h2>
        {files.length === 0 ? (
          <p className="text-sm text-zinc-500">No files stored.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file) => {
              const open = previewFileId === file.id;
              return (
                <li
                  key={file.id}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="flex items-center justify-between gap-2 px-4 py-3">
                    <span className="text-sm font-medium">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-sm text-zinc-500 hover:underline"
                      onClick={() =>
                        setPreviewFileId(open ? null : file.id)
                      }
                    >
                      {open ? "Hide" : "Preview"}
                    </Button>
                  </div>
                  {open && (
                    <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
                      <VaultAttachment attachment={file} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
