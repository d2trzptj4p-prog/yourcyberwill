"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Profile } from "@/lib/types";
import { Check, X } from "@phosphor-icons/react";

type ProfileFormProps = {
  profile: Profile;
};

export function ProfileForm({ profile }: ProfileFormProps) {
  const [fullName, setFullName] = useState(profile.full_name ?? "");
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
      .update({ 
        full_name: fullName, 
        bio, 
        updated_at: new Date().toISOString() 
      })
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
    <form onSubmit={handleSave} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Email" value={profile.email ?? "—"} />
        <div className="space-y-2">
          <label htmlFor="fullName" className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
            Full name
          </label>
          <Input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your name"
            className="rounded-lg border border-slate-300 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label htmlFor="bio" className="block text-sm font-medium text-black dark:text-white">
          Bio
        </label>
        <Textarea
          id="bio"
          name="bio"
          rows={6}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Tell us a bit about yourself..."
          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-black outline-none ring-slate-400 focus:ring-2 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={status === "saving"}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-black px-6 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-slate-200"
        >
          {status === "saving" ? "Saving…" : "Save Changes"}
        </Button>
        {status === "saved" && (
          <div className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            <Check weight="bold" className="h-4 w-4" />
            Saved successfully
          </div>
        )}
        {status === "error" && errorMessage && (
          <div className="inline-flex items-center gap-2 text-sm font-medium text-red-600 dark:text-red-400">
            <X weight="bold" className="h-4 w-4" />
            {errorMessage}
          </div>
        )}
      </div>
    </form>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <span className="block text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
        {label}
      </span>
      <div className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
        <span className="text-sm text-black dark:text-white">{value}</span>
      </div>
    </div>
  );
}
