# Check-In Reminder System

This system sends hourly reminder emails to users when they have less than 50% of their check-in time remaining.

## How It Works

### Check-In Timeline
- **Check-in interval**: 90 days (default)
- **Reminder threshold**: 50% of interval = 45 days
- Once a user has less than 45 days remaining, they receive a reminder email

### Components

#### 1. Database Schema (Migration)
File: `supabase/migrations/20260601000000_add_reminder_notification.sql`

Adds to `public.profiles`:
- `last_reminder_notification_at`: Timestamp of when the reminder was sent
- `reminder_notification_sent`: Boolean flag to ensure reminders are only sent once per check-in cycle

#### 2. Edge Function
File: `supabase/functions/check-in-reminder/index.ts`

**What it does:**
- Runs as a scheduled function (every hour)
- Queries all active check-ins that haven't received a reminder yet
- For each user with < 50% time remaining:
  - Calculates time remaining (days + hours)
  - Sends a branded email via Resend
  - Marks reminder as sent in the database

**Email content includes:**
- Current time remaining (formatted: "X days and Y hours")
- Percentage of time left
- Call-to-action link to dashboard
- Professional Cipherwill branding

#### 3. Scheduler (Cron Job)
File: `supabase/migrations/20260601000001_schedule_check_in_reminder.sql`

**Schedule:** Every hour at :00 (10:00 UTC, 11:00 UTC, etc.)
**Cron expression:** `0 * * * *`

#### 4. Manual Trigger API (Optional)
File: `app/api/internal/trigger-check-in-reminder/route.ts`

For testing/development, you can manually trigger the reminder function:

```bash
curl -X POST http://localhost:3000/api/internal/trigger-check-in-reminder
```

## Configuration

The system uses these environment variables:
- `RESEND_API_KEY`: Required for sending emails
- `RESEND_FROM_EMAIL`: Email sender address (defaults to "emailer@contracted.pw")
- `SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key for database access
- `NEXT_PUBLIC_APP_URL`: App URL for dashboard links (defaults to localhost:3000)
- `CHECK_IN_INTERVAL_MINUTES`: Optional override for check-in interval (for testing)

## Testing

### Test in Development
1. Set `CHECK_IN_INTERVAL_MINUTES=1` to make the check-in window 1 minute (50% = 30 seconds)
2. Create a test user and start a check-in
3. Wait 30 seconds for the reminder to qualify
4. Call the manual trigger endpoint: `POST /api/internal/trigger-check-in-reminder`
5. Verify the email was sent and `reminder_notification_sent` flag is set

### Test in Production
1. Create a user with a check-in that has less than 45 days remaining
2. Call the manual trigger endpoint
3. Check email delivery in Resend dashboard
4. Verify database flags were updated

## Email Template

The reminder email includes:
- **Subject**: `⏰ Reminder: Check in soon – X% time remaining`
- **Body**:
  - Personalized greeting
  - Amount of time remaining
  - Explanation of why check-ins matter
  - Button link to dashboard

Example email:
```
Hi John Doe,

This is a friendly reminder that your Cipherwill check-in deadline is approaching. 
You have approximately 15 days and 8 hours left to complete your check-in.

Once you check in, your recipients will be notified and can access your vault if 
anything happens to you. Don't leave them waiting!

[Check In Now] ← Button links to dashboard

— Cipherwill
```

## Database Queries

### Find users due for reminder
```sql
SELECT id, email, full_name, check_in_due_at
FROM profiles
WHERE check_in_active = true
  AND reminder_notification_sent = false
  AND check_in_due_at > now()
  AND (EXTRACT(EPOCH FROM (check_in_due_at - now())) * 1000) < 45 * 24 * 60 * 60 * 1000
ORDER BY check_in_due_at ASC;
```

### Reset reminder flag (to send again)
```sql
UPDATE profiles
SET reminder_notification_sent = false
WHERE id = 'user-id';
```

### Check reminder history
```sql
SELECT id, email, full_name, check_in_due_at, 
       reminder_notification_sent, last_reminder_notification_at
FROM profiles
WHERE check_in_active = true
ORDER BY last_reminder_notification_at DESC
LIMIT 10;
```

## Behavior Details

1. **One reminder per cycle**: Each user gets exactly one reminder email per 90-day check-in cycle (when reminder_notification_sent is true)

2. **Time-based threshold**: Reminders are sent when:
   - Check-in is active (`check_in_active = true`)
   - Not yet overdue (`check_in_due_at > now()`)
   - Less than 45 days remaining
   - Reminder hasn't been sent yet

3. **Resilience**:
   - If email fails to send, error is logged but function continues
   - If database update fails after email is sent, error is returned
   - Repeated function calls are safe (will skip already-notified users)

4. **Hourly cadence**: Function checks every hour, so reminders are sent within 1 hour of crossing the 50% threshold

## Troubleshooting

### Reminders not sending
1. Verify `RESEND_API_KEY` is set and valid
2. Check edge function logs in Supabase dashboard
3. Verify user has `check_in_active = true` and `reminder_notification_sent = false`
4. Verify `check_in_due_at` is more than 45 days from now

### Duplicate reminders
1. Check `reminder_notification_sent` flag
2. Run manual trigger endpoint to debug
3. Reset flag if needed (see queries above)

### Email formatting issues
1. Check Resend email templates
2. Verify `RESEND_FROM_EMAIL` is verified in Resend
3. Test with manual trigger endpoint

## Future Enhancements

Possible improvements:
- Make reminder threshold configurable per user
- Allow multiple reminders (e.g., at 50%, 25%, 10%)
- Include custom email templates from user settings
- Track reminder delivery/open rates
- Send reminders to recipients as well
