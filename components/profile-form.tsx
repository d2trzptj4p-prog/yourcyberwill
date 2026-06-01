"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/types";

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [bio, setBio] = useState(profile.bio ?? "");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("saving");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ bio, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("saved");
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" value={profile.email ?? "—"} />
        <Field label="Full name" value={profile.full_name ?? "—"} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="bio" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Bio
        </label>
        <Textarea
          id="bio"
          name="bio"
          rows={6}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Tell us a bit about yourself..."
          className="w-full resize-y rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={status === "saving"}
          className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {status === "saving" ? "Saving…" : "Save profile"}
        </Button>
        {status === "saved" && (
          <span className="text-sm text-emerald-600 dark:text-emerald-400">
            Saved
          </span>
        )}
        {status === "error" && errorMessage && (
          <span className="text-sm text-red-600 dark:text-red-400">
            {errorMessage}
          </span>
        )}
      </div>
    </form>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <span className="text-sm text-zinc-900 dark:text-zinc-100">{value}</span>
    </div>
  );
}
