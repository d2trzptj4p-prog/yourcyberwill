"use client";

import { useState } from "react";
import { CHECK_IN_PERIODS } from "@/lib/check-in-periods";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CheckInPeriodSelectorProps {
  open: boolean;
  onSelect: (days: number) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function CheckInPeriodSelector({
  open,
  onSelect,
  onCancel,
  loading = false,
}: CheckInPeriodSelectorProps) {
  const [selectedDays, setSelectedDays] = useState(30);

  const handleConfirm = () => {
    onSelect(selectedDays);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select Check-in Period</DialogTitle>
          <DialogDescription>
            How often would you like to check in with yourcyberwill?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedDays.toString()} onValueChange={(v) => setSelectedDays(Number(v))}>
            {CHECK_IN_PERIODS.map((period) => (
              <div key={period.days} className="flex items-center space-x-3 rounded-lg border border-slate-200 p-4 cursor-pointer hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900">
                <RadioGroupItem value={period.days.toString()} id={`period-${period.days}`} />
                <label
                  htmlFor={`period-${period.days}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    {period.label}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {period.description}
                  </p>
                </label>
              </div>
            ))}
          </RadioGroup>

          <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
            You can change this period later if needed. Your recipients will be notified if you don't check in by your due date.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {loading ? "Starting…" : "Start Check-ins"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
