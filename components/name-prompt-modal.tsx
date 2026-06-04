"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type NamePromptModalProps = {
  profileId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
};

export function NamePromptModal({
  profileId,
  isOpen,
  onClose,
  onSave,
}: NamePromptModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: name.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", profileId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setName("");
      onSave?.();
      onClose();
    } catch {
      setError("Failed to save name. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-black">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          Complete Your Profile
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Let us know your name so we can personalize your experience.
        </p>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="nameInput"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Full Name
            </label>
            <Input
              id="nameInput"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              autoFocus
              disabled={isLoading}
              className="mt-2 h-10"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex-1"
            >
              {isLoading ? "Saving…" : "Save Name"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
