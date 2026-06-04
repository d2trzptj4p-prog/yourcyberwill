"use client";

import { useEffect, useState } from "react";
import type { DecryptedFile } from "@/lib/vault-types";

export function VaultAttachment({ attachment }: { attachment: DecryptedFile }) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const blob = new Blob([new Uint8Array(attachment.data)], {
      type: attachment.mimeType,
    });
    const url = URL.createObjectURL(blob);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment]);

  if (!objectUrl) {
    return null;
  }

  const isImage = attachment.mimeType.startsWith("image/");
  const isAudio = attachment.mimeType.startsWith("audio/");
  const isPdf = attachment.mimeType === "application/pdf";

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900/60">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium">{attachment.name}</span>
        <a
          href={objectUrl}
          download={attachment.name}
          className="text-sm text-slate-600 underline-offset-2 hover:underline dark:text-slate-400"
        >
          Download
        </a>
      </div>

      {isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={objectUrl}
          alt={attachment.name}
          className="max-h-64 rounded-md object-contain"
        />
      )}

      {isAudio && <audio controls src={objectUrl} className="w-full" />}

      {isPdf && (
        <iframe
          src={objectUrl}
          title={attachment.name}
          className="h-64 w-full rounded-md border border-slate-200 dark:border-slate-700"
        />
      )}

      {!isImage && !isAudio && !isPdf && (
        <p className="text-xs text-slate-500">
          Preview not available for this file type. Use download to open it.
        </p>
      )}
    </div>
  );
}
