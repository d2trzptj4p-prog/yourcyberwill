"use client";

import Link from "next/link";
import { useCheckInGuard } from "@/components/check-in-guard-provider";
import { useVault } from "@/components/vault/vault-context";
import { Check, CheckCircleIcon, Circle } from "@phosphor-icons/react";
import type { Profile } from "@/lib/types";

type SetupChecklistProps = {
  profile: Profile;
};

export function SetupChecklist({ profile }: SetupChecklistProps) {
  const { checkIn } = useCheckInGuard();
  const { unlocked } = useVault();

  // Only show if check-in hasn't started yet
  if (checkIn?.active) return null;

  const hasName = !!(profile.full_name && profile.full_name.trim() !== "");
  const recipientCount = checkIn?.recipient_count ?? 0;
  const hasRecipient = recipientCount >= 1;
  const hasVault = unlocked;

  const locked = checkIn?.recipients_notified_complete === true;



  if (!locked) return (
    <section className="space-y-4 rounded-2xl border-2 border-slate-200 mb-8 p-8 dark:border-zinc-800">
      <div>
        <h2 className="text-2xl text-black dark:text-white">
          Setup Checklist
        </h2>
        <p className="mt-3 mb-2 text-sm text-zinc-600 dark:text-zinc-400">
          Complete the following requirements before initiating your first check in
        </p>
      </div>

      <div className="space-y-3">
        {/* Name Item */}
        <ChecklistItem
          title="Add your name (preferably real name)"
          description={hasName ? `Your name: ${profile.full_name}` : "Complete your profile with your full name."}
          done={hasName}
          action={
            !hasName && (
              <Link
                href="/dashboard/profile"
                className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
              >
                Edit Profile
              </Link>
            )
          }
        />

        {/* Recipient Item */}
        <ChecklistItem
          title="Add a recipient"
          description={hasRecipient ? `${recipientCount} recipient${recipientCount !== 1 ? "s" : ""} added` : "Add at least one beneficiary to your check-in."}
          done={hasRecipient}
          // action={
          //   !hasRecipient && (
          //     <a
          //       href="#recipients"
          //       className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          //     >
          //       Scroll to Recipients
          //     </a>
          //   )
          // }
        />

        {/* Vault Item */}
        <ChecklistItem
          title="Secure your vault"
          description={hasVault ? "Vault is secured" : "Unlock your vault"}
          done={hasVault}
          // action={
          //   !hasVault && (
          //     <a
          //       href="#vault"
          //       className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
          //     >
          //       Setup Vault
          //     </a>
          //   )
          // }
        />
      </div>
    </section>
  );

  return <section className="space-y-4 rounded-2xl border-2 border-slate-200 mb-8 p-8 dark:border-zinc-800">
    Thank you for using YourCipherWill. Your benificiaries have been emailed with an encrypted link that destructs in 15 days. This account has now will be locked. Email support@yourcyberwill.com for any questions.
  </section>
}

function ChecklistItem({
  title,
  description,
  done,
  action,
}: {
  title: string;
  description: string;
  done: boolean;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl p-3 transition-colors ${
        done
          ? "border-emerald-200 bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/20"
          : "border-zinc-200 bg-slate-100 dark:border-zinc-700 dark:bg-zinc-900/50"
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">
        {done ? (
          <CheckCircleIcon
            weight="fill"
            className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
          />
        ) : (
          <Circle className="h-5 w-5 text-zinc-400 dark:text-zinc-600" />
        )}
      </div>
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${
            done
              ? "text-emerald-900 dark:text-emerald-100"
              : "text-zinc-900 dark:text-zinc-100"
          }`}
        >
          {title}
        </p>
        <p
          className={`text-xs ${
            done
              ? "text-emerald-700 dark:text-emerald-200"
              : "text-zinc-600 dark:text-zinc-400"
          }`}
        >
          {description}
        </p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
