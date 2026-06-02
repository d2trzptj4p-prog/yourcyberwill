// Example code snippets for integrating with the reminder system

// ============================================================================
// 1. TRIGGER REMINDER FUNCTION FROM YOUR APP
// ============================================================================

/**
 * Call this from anywhere in your Next.js app to manually trigger reminders
 * Useful for testing or admin panels
 */
export async function triggerCheckInReminder() {
  try {
    const response = await fetch('/api/internal/trigger-check-in-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Trigger failed: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Reminders sent:', data.reminders_sent);
    console.log('Results:', data.results);
    return data;
  } catch (error) {
    console.error('Error triggering reminders:', error);
    throw error;
  }
}

// ============================================================================
// 2. CHECK REMINDER STATUS FOR CURRENT USER
// ============================================================================

import { createClient } from '@supabase/supabase-js';

export async function getReminderStatus(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: profile, error } = await supabase
    .from('profiles')
    .select(
      'check_in_active, check_in_due_at, reminder_notification_sent, last_reminder_notification_at'
    )
    .eq('id', userId)
    .single();

  if (error) throw error;

  return {
    isActive: profile.check_in_active,
    dueAt: profile.check_in_due_at,
    reminderSent: profile.reminder_notification_sent,
    lastReminderAt: profile.last_reminder_notification_at,
    timeRemaining: profile.check_in_due_at
      ? new Date(profile.check_in_due_at).getTime() - Date.now()
      : null,
  };
}

// ============================================================================
// 3. DISPLAY REMINDER STATUS ON DASHBOARD
// ============================================================================

import React, { useEffect, useState } from 'react';

export function ReminderStatusCard({ userId }: { userId: string }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getReminderStatus(userId);
        setStatus(result);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  if (loading) return <div>Loading...</div>;
  if (!status?.isActive) return null;

  const daysRemaining = status.timeRemaining
    ? Math.floor(status.timeRemaining / (24 * 60 * 60 * 1000))
    : 0;
  const isUnderThreshold = daysRemaining < 45;

  return (
    <div
      className={`p-4 rounded-lg ${
        isUnderThreshold
          ? 'bg-yellow-50 border border-yellow-200'
          : 'bg-blue-50 border border-blue-200'
      }`}
    >
      <h3 className="font-semibold mb-2">
        ⏰ Check-In Status
      </h3>
      <p className={isUnderThreshold ? 'text-yellow-700' : 'text-blue-700'}>
        {daysRemaining} days remaining
      </p>
      {status.reminderSent && (
        <p className="text-sm text-gray-600 mt-2">
          📧 Reminder email sent on{' '}
          {new Date(status.lastReminderAt).toLocaleDateString()}
        </p>
      )}
      {isUnderThreshold && !status.reminderSent && (
        <p className="text-sm text-yellow-700 mt-2">
          ⚠️ Less than 50% time remaining. Reminder coming soon!
        </p>
      )}
    </div>
  );
}

// ============================================================================
// 4. ADMIN TOOL: BULK RESET REMINDERS
// ============================================================================

export async function resetAllReminders() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error, data } = await supabase
    .from('profiles')
    .update({
      reminder_notification_sent: false,
      last_reminder_notification_at: null,
    })
    .eq('check_in_active', true)
    .select('id');

  if (error) throw error;

  console.log(`Reset ${data?.length} reminder flags`);
  return data;
}

// ============================================================================
// 5. ADMIN TOOL: GET REMINDER STATISTICS
// ============================================================================

export async function getReminderStats() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: stats, error } = await supabase
    .from('profiles')
    .select('id, reminder_notification_sent, check_in_active')
    .eq('check_in_active', true);

  if (error) throw error;

  const totalActive = stats?.length || 0;
  const reminders_sent = stats?.filter((p) => p.reminder_notification_sent).length || 0;
  const pending = totalActive - reminders_sent;

  return {
    total_active_check_ins: totalActive,
    reminders_sent,
    pending_reminder_count: pending,
    percentage_reminded: totalActive > 0 ? ((reminders_sent / totalActive) * 100).toFixed(1) : 0,
  };
}

// ============================================================================
// 6. RESET REMINDER FOR SPECIFIC USER
// ============================================================================

export async function resetReminderForUser(userId: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('profiles')
    .update({
      reminder_notification_sent: false,
    })
    .eq('id', userId);

  if (error) throw error;

  console.log(`Reset reminder for user ${userId}`);
}

// ============================================================================
// 7. SEND CUSTOM REMINDER EMAIL
// ============================================================================

export async function sendCustomReminder(
  email: string,
  name: string,
  timeRemaining: string
) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'emailer@contracted.pw';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: RESEND_FROM_EMAIL,
      to: [email],
      subject: '⏰ Reminder: Complete your yourcyberwill check-in',
      html: `
        <p>Hi ${name},</p>
        <p>Your check-in deadline is approaching. You have <strong>${timeRemaining}</strong> left.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Check In Now</a></p>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }

  return response.json();
}

// ============================================================================
// 8. LISTEN TO REMINDER EVENTS (REALTIME)
// ============================================================================

import { RealtimeChannel } from '@supabase/supabase-js';

export function subscribeToReminderUpdates(
  userId: string,
  onUpdate: (profile: any) => void
): () => void {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const channel: RealtimeChannel = supabase
    .channel(`reminder:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
}

// ============================================================================
// 9. EXAMPLE USAGE IN A COMPONENT
// ============================================================================

export function AdminReminderPanel() {
  const [stats, setStats] = useState(null);
  const [triggering, setTriggering] = useState(false);

  const handleTrigger = async () => {
    setTriggering(true);
    try {
      const result = await triggerCheckInReminder();
      alert(`Sent ${result.reminders_sent} reminders!`);
      // Refresh stats
      const newStats = await getReminderStats();
      setStats(newStats);
    } finally {
      setTriggering(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Reset all reminder flags?')) {
      await resetAllReminders();
      const newStats = await getReminderStats();
      setStats(newStats);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Reminder System Admin</h2>

      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Active Check-ins</p>
            <p className="text-2xl font-bold">{stats.total_active_check_ins}</p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <p className="text-sm text-gray-600">Reminders Sent</p>
            <p className="text-2xl font-bold">{stats.reminders_sent}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold">{stats.pending_reminder_count}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleTrigger}
          disabled={triggering}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {triggering ? 'Triggering...' : 'Trigger Reminders'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reset All Reminders
        </button>
      </div>
    </div>
  );
}
