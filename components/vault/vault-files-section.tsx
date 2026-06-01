"use client";

import { useCallback, useEffect, useState } from "react";
import { VaultAttachment } from "@/components/vault-attachment";
import { Button } from "@/components/ui/button";
import { useCheckInGuard } from "@/components/check-in-guard-provider";
import { useVault } from "@/components/vault/vault-context";
import { formatBytes } from "@/lib/tier-limits";
import { useTierLimits } from "@/lib/use-tier-limits";
import { createClient } from "@/lib/supabase/client";
import {
  buildEncryptedFilePackage,
  decryptFileRow,
  toFileMetaPayload,
} from "@/lib/vault-file-crypto";
import { VAULT_FILES_BUCKET } from "@/lib/vault-storage";
import type { DecryptedFile, VaultFileRow } from "@/lib/vault-types";

export function VaultFilesSection() {
  const { guardEdit, checkIn } = useCheckInGuard();
  const locked = checkIn?.recipients_notified_complete === true;
  const { withKey, refreshUnlocked } = useVault();
  const { tier, refresh: refreshTier } = useTierLimits();
  const [items, setItems] = useState<DecryptedFile[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const storageFull =
    tier !== null &&
    tier.usage.storageBytes >= tier.limits.maxTotalStorageBytes;

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Not signed in");
      }

      const response = await fetch("/api/vault/files");
      if (!response.ok) {
        throw new Error("Failed to load files");
      }
      const rows = (await response.json()) as VaultFileRow[];

      const decrypted = await withKey(async (key) => {
        const results: DecryptedFile[] = [];
        for (const row of rows) {
          const { data: blob, error: downloadError } = await supabase.storage
            .from(VAULT_FILES_BUCKET)
            .download(row.storage_path);

          if (downloadError || !blob) {
            throw new Error(
              `Could not download encrypted file: ${downloadError?.message ?? "unknown"}`,
            );
          }

          const encryptedBytes = new Uint8Array(await blob.arrayBuffer());
          results.push(await decryptFileRow(row, encryptedBytes, key));
        }
        return results;
      });

      setItems(decrypted);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load");
    }
  }, [withKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleUpload(event: React.FormEvent) {
    event.preventDefault();
    if (!pendingFile || !tier) {
      setError("Choose a file first.");
      return;
    }
    guardEdit(async () => {
      setError(null);
      setUploading(true);

      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Not signed in");
        }

        const pkg = await withKey((key) =>
          buildEncryptedFilePackage(
            pendingFile,
            key,
            user.id,
            tier.limits.maxFileUploadBytes,
          ),
        );

        if (
          tier.usage.storageBytes + pkg.encryptedBytes.byteLength >
          tier.limits.maxTotalStorageBytes
        ) {
          throw new Error(
            `Total storage limit reached (${formatBytes(tier.limits.maxTotalStorageBytes)} on ${tier.tier} plan).`,
          );
        }

        const { error: uploadError } = await supabase.storage
          .from(VAULT_FILES_BUCKET)
          .upload(pkg.storagePath, pkg.encryptedBytes, {
            contentType: "application/octet-stream",
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        const response = await fetch("/api/vault/files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toFileMetaPayload(pkg)),
        });

        if (!response.ok) {
          await supabase.storage
            .from(VAULT_FILES_BUCKET)
            .remove([pkg.storagePath]);
          const data = await response.json();
          throw new Error(data.error ?? "Failed to register file");
        }

        setPendingFile(null);
        const input = document.getElementById(
          "vault-file-input",
        ) as HTMLInputElement | null;
        if (input) {
          input.value = "";
        }
        await load();
        await refreshTier();
        await refreshUnlocked();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file?")) {
      return;
    }
    guardEdit(async () => {
      await fetch(`/api/vault/files/${id}`, { method: "DELETE" });
      if (previewId === id) {
        setPreviewId(null);
      }
      await load();
      await refreshTier();
    });
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && tier && file.size > tier.limits.maxFileUploadBytes) {
      setError(
        `File must be ${formatBytes(tier.limits.maxFileUploadBytes)} or smaller on your ${tier.tier} plan.`,
      );
      event.target.value = "";
      setPendingFile(null);
      return;
    }
    setError(null);
    setPendingFile(file);
  }

  return (
    <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
      <div>
        <h2 className="text-lg font-medium">Files</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Encrypted in your browser, then stored in Supabase Storage.{" "}
          {tier ? (
            <>
              {tier.tier === "premium" ? "Premium" : "Free"}: up to{" "}
              {formatBytes(tier.limits.maxFileUploadBytes)} per file,{" "}
              {formatBytes(tier.usage.storageBytes)} /{" "}
              {formatBytes(tier.limits.maxTotalStorageBytes)} total used.
            </>
          ) : (
            "Loading limits…"
          )}
        </p>
      </div>

      <form
        onSubmit={handleUpload}
        className="mt-4 flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/40"
      >
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm">
          <span className="font-medium">Upload file</span>
          <input
            id="vault-file-input"
            type="file"
            onChange={onFileChange}
            disabled={storageFull || !tier || locked}
            className="text-xs file:mr-3 file:rounded-full file:border-0 file:bg-zinc-200 file:px-3 file:py-1.5 disabled:opacity-50 dark:file:bg-zinc-800"
          />
        </label>
        <Button
          type="submit"
          disabled={uploading || !pendingFile || storageFull || !tier || locked}
          className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {uploading ? "Encrypting & uploading…" : "Encrypt & upload"}
        </Button>
      </form>

      {storageFull && (
        <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
          File storage is full for your plan. Delete files or upgrade to Premium.
        </p>
      )}

      {locked && (
        <p className="mt-2 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
          All emails have been sent to your recipients. Vault edits are disabled.
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      {loadError && <p className="mt-2 text-sm text-red-600">{loadError}</p>}

      {!loadError && items.length === 0 && (
        <p className="mt-4 text-sm text-zinc-500">No files saved yet.</p>
      )}

      <ul className="mt-4 space-y-2">
        {items.map((file) => {
          const open = previewId === file.id;
          return (
            <li
              key={file.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <span className="text-sm font-medium">{file.name}</span>
                <div className="flex gap-3 text-sm">
                  <Button
                    type="button"
                    onClick={() => setPreviewId(open ? null : file.id)}
                    variant="ghost"
                    className="text-zinc-500 hover:underline"
                  >
                    {open ? "Hide" : "Preview"}
                  </Button>
                  <Button
                    type="button"
                    disabled={locked}
                    onClick={() => handleDelete(file.id)}
                    variant="ghost"
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </Button>
                </div>
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
    </section>
  );
}
