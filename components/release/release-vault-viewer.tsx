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
import { Input } from "@/components/ui/input";
import { Footer } from "@/app/components/footer";

type ReleaseVaultPayload = {
  recipient_name: string;
  owner_name: string;
  wrapped_vault_key: string;
  wrapped_vault_key_iv: string;
  passwords: VaultPasswordRow[];
  notes: VaultNoteRow[];
  files: VaultFileRow[];
};

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
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm print:hidden">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          {title}
        </h3>
        <div className="flex gap-2 items-center mt-3">
          <Input
            readOnly
            value={value}
            className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            type="button"
            onClick={handleCopy}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 min-w-[75px]"
          >
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
        <div className="mt-5 flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-600 bg-white hover:bg-slate-50"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ReleaseVaultViewer({ token }: { token: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [passwords, setPasswords] = useState<DecryptedPassword[]>([]);
  const [notes, setNotes] = useState<DecryptedNote[]>([]);
  const [files, setFiles] = useState<DecryptedFile[]>([]);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [hiddenPasswords, setHiddenPasswords] = useState<Set<string>>(() => new Set());
  
  const [activeTab, setActiveTab] = useState<"passwords" | "notes" | "files">("passwords");
  const [popupData, setPopupData] = useState<{ title: string; value: string } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/release/${encodeURIComponent(token)}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "This legacy release link is no longer valid or has expired.");
      }

      const payload = (await response.json()) as ReleaseVaultPayload;
      setOwnerName(payload.owner_name);
      setRecipientName(payload.recipient_name);

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
        const fileRes = await fetch(`/api/release/${encodeURIComponent(token)}/files/${row.id}`);
        if (!fileRes.ok) {
          throw new Error("Failed to safely decode secure asset file.");
        }
        const { ciphertext_base64 } = (await fileRes.json()) as { ciphertext_base64: string; };
        const encryptedBytes = base64ToBytes(ciphertext_base64);
        decryptedFiles.push(await decryptFileRow(row, encryptedBytes, vaultKey));
      }
      setFiles(decryptedFiles);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to safely unlock legacy payload.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="py-12 text-center bg-white min-h-screen">
        <p className="text-base text-slate-600 animate-pulse font-medium">
          Securely unlocking and decrypting estate assets…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-8 p-6 bg-white border border-red-200 rounded-2xl shadow-sm">
        <h2 className="text-base font-semibold text-red-800 mb-1">Access Error</h2>
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 space-y-8 bg-white text-slate-900 antialiased selection:bg-slate-100 print:my-0 print:px-0">
      
      {/* Header Info */}
      <header className="border-b border-slate-200 pb-6 print:pb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md print:border print:border-slate-300 print:bg-transparent">
          Digital Legacy Document
        </span>
        <h1 className="text-2xl font-semibold text-slate-900 mt-3">
          Hello {recipientName || "there"},
        </h1>
        <p className="mt-2 text-base leading-relaxed text-slate-600">
          This secure portal has been automatically released to you per instructions left by <strong>{ownerName}</strong>. 
          Everything listed below has been fully decrypted using your unique token key.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 items-center justify-between text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl p-3 print:hidden">
          <p>This are files, passwords, and notes written by {ownerName} securely decrypted to you. For security reasons, <b>this link will self-destruct and expire in 15 days</b> from the sending of the email. <br/>
          <br/> Email support@yourcyberwill.com for questions.</p>
          <Button 
            onClick={() => window.print()} 
          >
            Download this document as PDF
          </Button>
        </div>
      </header>

      {/* Navigation tabs - Hidden entirely when printing */}
      <div className="flex border-b border-slate-200 gap-2 print:hidden">
        <button
          onClick={() => setActiveTab("passwords")}
          className={`pb-3 px-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "passwords" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Passwords ({passwords.length})
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`pb-3 px-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "notes" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Letters & Instructions ({notes.length})
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`pb-3 px-2 text-sm font-medium border-b-2 transition-all ${
            activeTab === "files" ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Documents & Files ({files.length})
        </button>
      </div>

      {/* PASSWORDS SEGMENT */}
      <div className={`${activeTab === "passwords" ? "block" : "hidden"} print:block print:space-y-4`}>
        <h2 className="text-lg font-medium text-slate-900 hidden print:block print:mb-2 print:border-b print:pb-1">
          1. Account Passwords & Credentials
        </h2>
        {passwords.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-2">No account passwords left in this directory.</p>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl print:border-slate-300">
            <table className="w-full min-w-[32rem] table-fixed text-left text-sm print:min-w-0">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 print:bg-slate-100">
                  <th className="w-[25%] py-2.5 px-4 font-medium">Account Type</th>
                  <th className="w-[35%] py-2.5 px-4 font-medium">Username</th>
                  <th className="w-[40%] py-2.5 px-4 font-medium">Password</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-200">
                {passwords.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 print:hover:bg-transparent page-break-inside-avoid">
                    {/* Truncated Account Type Button */}
                    <td className="py-3 px-4 font-medium text-slate-900 max-w-[150px]">
                      <button
                        type="button"
                        onClick={() => setPopupData({ title: "Account Type", value: item.account_type })}
                        className="block max-w-full truncate text-left hover:underline print:hidden"
                      >
                        {item.account_type}
                      </button>
                      <span className="hidden print:inline print:whitespace-normal print:break-words">
                        {item.account_type}
                      </span>
                    </td>
                    
                    {/* Truncated Username Button */}
                    <td className="py-3 px-4 font-mono text-xs text-slate-600 max-w-[200px]">
                      <button
                        type="button"
                        onClick={() => setPopupData({ title: "Username", value: item.username })}
                        className="block max-w-full truncate text-left hover:underline print:hidden"
                      >
                        {item.username}
                      </button>
                      <span className="hidden print:inline print:whitespace-normal print:break-all">
                        {item.username}
                      </span>
                    </td>

                    {/* Truncated Password Column Block */}
                    <td className="py-3 px-4 font-mono text-xs text-slate-900 max-w-[250px]">
                      <div className="flex items-center justify-between gap-2 max-w-full print:block">
                        <div className="truncate flex-1 print:hidden">
                          {hiddenPasswords.has(item.id) ? (
                            <span className="text-slate-400 tracking-wider">••••••••</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPopupData({ title: "Password", value: item.password })}
                              className="block max-w-full truncate text-left hover:underline"
                            >
                              {item.password}
                            </button>
                          )}
                        </div>
                        
                        {/* Revealed string for paper print outs */}
                        <span className="hidden print:inline print:whitespace-normal print:break-all">
                          {item.password}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            setHiddenPasswords((prev) => {
                              const next = new Set(prev);
                              if (next.has(item.id)) next.delete(item.id);
                              else next.add(item.id);
                              return next;
                            })
                          }
                          className="text-slate-500 hover:text-slate-900 underline text-xs ml-2 shrink-0 print:hidden"
                        >
                          {hiddenPasswords.has(item.id) ? "Reveal" : "Hide"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* LETTERS & NOTES SEGMENT */}
      <div className={`${activeTab === "notes" ? "block" : "hidden"} print:block print:space-y-4 print:pt-6`}>
        <h2 className="text-lg font-medium text-slate-900 hidden print:block print:mb-2 print:border-b print:pb-1 print:page-break-before-always">
          2. Letters & Legacy Instructions
        </h2>
        {notes.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-2 print:block">No custom text records provided.</p>
        ) : (
          <ul className="space-y-3 print:space-y-6">
            {notes.map((note) => {
              const open = expandedNoteId === note.id;
              return (
                <li key={note.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm print:shadow-none print:border-slate-300 print:break-inside-avoid">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-base font-medium text-slate-900 bg-slate-50/50 hover:bg-slate-50 print:bg-slate-100 print:py-2 print:px-4"
                    onClick={() => setExpandedNoteId(open ? null : note.id)}
                  >
                    <span>{note.title}</span>
                    <span className="text-slate-400 text-lg print:hidden">{open ? "−" : "+"}</span>
                  </Button>
                  <div className={`${open ? "block" : "hidden"} border-t border-slate-100 px-5 py-4 bg-white text-slate-800 leading-relaxed max-w-none prose prose-zinc print:block print:border-slate-200 print:px-4 print:py-3`}>
                    <VaultMarkdown content={note.body} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* SECURE ATTACHMENTS SEGMENT */}
      <div className={`${activeTab === "files" ? "block" : "hidden"} print:block print:space-y-4 print:pt-6`}>
        <h2 className="text-lg font-medium text-slate-900 hidden print:block print:mb-2 print:border-b print:pb-1 print:page-break-before-always">
          3. Documents & Attached Files
        </h2>
        {files.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-2 print:block">No legacy documents uploaded into this segment.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((file) => {
              const open = previewFileId === file.id;
              return (
                <li key={file.id} className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm print:shadow-none print:border-slate-300 print:break-inside-avoid">
                  <div className="flex items-center justify-between gap-4 px-5 py-4 bg-slate-50/50 print:bg-slate-50 print:py-2 print:px-4">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-slate-400 text-lg shrink-0">📄</span>
                      <span className="text-sm font-medium text-slate-900 truncate">{file.name}</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-xs text-slate-700 bg-white border-slate-300 px-3 py-1.5 rounded-full hover:bg-slate-50 print:hidden"
                      onClick={() => setPreviewFileId(open ? null : file.id)}
                    >
                      {open ? "Close Attachment" : "View Attachment"}
                    </Button>
                  </div>
                  {open && (
                    <div className="border-t border-slate-100 p-4 bg-slate-50/20 flex justify-center print:hidden">
                      <VaultAttachment attachment={file} />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {popupData && (
        <ValuePopup
          title={popupData.title}
          value={popupData.value}
          onClose={() => setPopupData(null)}
        />
      )}

      {/* <Footer/> */}
    </div>
  );
}