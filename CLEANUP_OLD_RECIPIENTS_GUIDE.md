# Cleanup Old Recipients Edge Function

## Overview

This Supabase Edge Function automatically deletes recipient records that were notified more than 15 days ago. It helps keep the database clean by removing old notification records that are no longer needed.

## How It Works

### Trigger Options

**Option 1: Daily Cron Job (Recommended)**
- Scheduled to run daily at 02:00 UTC
- Automatically cleans up old records without manual intervention
- Uses the migration: `20260602172021_schedule_cleanup_old_recipients.sql`

**Option 2: Manual Trigger**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/cleanup-old-recipients \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

**Option 3: API Integration**
Call from your Next.js app:
```typescript
async function triggerCleanup() {
  const response = await fetch('/api/internal/cleanup-recipients', {
    method: 'POST'
  });
  return response.json();
}
```

## Database Impact

### What Gets Deleted
- Recipients where `notified_at` is older than 15 days from current time
- Only records with a valid `notified_at` timestamp

### What Gets Preserved
- Recent recipient records (< 15 days old)
- Recipients without a `notified_at` value (not yet notified)
- All user profile data remains intact

### Example
If today is June 2, 2026, the function will delete all recipients notified before May 18, 2026.

## Response Format

### Success (200)
```json
{
  "deleted_count": 42,
  "cutoff_date": "2026-05-18T17:18:35.236Z",
  "execution_time_ms": 235
}
```

### Error (500)
```json
{
  "deleted_count": 0,
  "error": "Error message explaining the failure",
  "execution_time_ms": 145
}
```

## Configuration

### Retention Period
Currently set to 15 days. To change:

**File:** `supabase/functions/cleanup-old-recipients/index.ts`
**Line 6:** `const DAYS_TO_RETAIN = 15;`

Change the number to your desired retention period.

### Cron Schedule
Currently set to daily at 02:00 UTC. To change:

**File:** `supabase/migrations/20260602172021_schedule_cleanup_old_recipients.sql`
**Line 3:** `'0 2 * * *'`

Cron expression format: `minute hour day-of-month month day-of-week`

Examples:
- `'0 2 * * *'` = Daily at 02:00 UTC
- `'0 12 * * 0'` = Weekly at 12:00 UTC (Sunday)
- `'0 */6 * * *'` = Every 6 hours
- `'0 9 * * *'` = Daily at 09:00 UTC

## Deployment

### 1. Deploy Migration
```bash
supabase migration list
supabase db push
```

### 2. Deploy Edge Function
```bash
supabase functions deploy cleanup-old-recipients
```

### 3. Verify Deployment
Check Supabase Dashboard:
- Functions > cleanup-old-recipients > Logs
- Should see successful executions at scheduled times

## Testing

### Manual Test (Development)
```bash
# Using Next.js API route
curl -X POST http://localhost:3000/api/internal/cleanup-recipients

# Or directly to Supabase functions locally
supabase functions serve --inspect-brk
# Then POST to http://localhost:54321/functions/v1/cleanup-old-recipients
```

### Verify Results
```sql
-- Count remaining recipients by notification age
SELECT 
  COUNT(*) as total,
  SUM(CASE WHEN notified_at > now() - interval '15 days' THEN 1 ELSE 0 END) as recent,
  SUM(CASE WHEN notified_at <= now() - interval '15 days' THEN 1 ELSE 0 END) as old
FROM public.recipients
WHERE notified_at IS NOT NULL;
```

## Monitoring

### Function Logs
1. Go to Supabase Dashboard
2. Navigate to Functions > cleanup-old-recipients
3. Click Logs tab
4. Filter by execution time to find your runs

### Cron Job Status
```sql
-- Check if cron job is scheduled
SELECT * FROM cron.job WHERE jobname = 'cleanup-old-recipients';

-- View cron job history (if available)
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'cleanup-old-recipients')
ORDER BY start_time DESC 
LIMIT 10;
```

### Track Deletions
Add this to your monitoring/analytics:

```typescript
// Log cleanup results to your analytics
const result = await fetch('/api/internal/cleanup-recipients', {
  method: 'POST'
});

const data = await result.json();
console.log(`Cleaned up ${data.deleted_count} old recipients`);
// Send to your analytics service
analytics.track('recipients_cleanup', {
  deleted_count: data.deleted_count,
  execution_time_ms: data.execution_time_ms,
  cutoff_date: data.cutoff_date
});
```

## Troubleshooting

### Cron Job Not Running
**Check 1:** Verify pg_cron extension is enabled
```sql
SELECT * FROM cron.job WHERE jobname = 'cleanup-old-recipients';
```

**Check 2:** Verify migration was applied
```bash
supabase migration list
```

**Check 3:** Check function logs for errors

### No Recipients Being Deleted
**Check 1:** Verify recipients exist with `notified_at` older than 15 days
```sql
SELECT id, notified_at, 
  EXTRACT(DAY FROM now() - notified_at) as days_since_notification
FROM public.recipients
WHERE notified_at IS NOT NULL
ORDER BY notified_at ASC
LIMIT 10;
```

**Check 2:** Verify the cutoff date calculation
- Current behavior: deletes if `notified_at < (now() - 15 days)`

### Function Timeout
- Edge functions have a default timeout of 10-30 seconds
- For very large recipient tables, this might not be enough
- Consider implementing pagination or increasing cron frequency

## Performance Considerations

- **Index:** Uses existing `recipients.user_id` index
- **Query Time:** Typically < 1 second for most databases
- **Batch Size:** No batch limiting (deletes all matching records)
- **Lock Duration:** RLS policies still apply (row-level security)

## Customization Examples

### Delete After Different Period
```typescript
// For 30-day retention
const DAYS_TO_RETAIN = 30;
```

### Soft Delete (Archive Instead)
```typescript
// Instead of DELETE, update a status column
const { error } = await supabase
  .from("recipients")
  .update({ archived_at: new Date().toISOString() })
  .is("archived_at", null)
  .lt("notified_at", cutoffDateISO);
```

### Delete Only Specific User Types
```typescript
// Delete from premium users only
const { error } = await supabase
  .from("recipients")
  .delete()
  .lt("notified_at", cutoffDateISO)
  .eq("user_id", premiumUserId);
```

### Log Deletions to Audit Table
```typescript
// Track what was deleted for compliance
const { data: toDelete } = await supabase
  .from("recipients")
  .select("id, user_id, email, notified_at")
  .lt("notified_at", cutoffDateISO);

await supabase.from("audit_log").insert({
  action: "recipients_cleanup",
  count: toDelete?.length || 0,
  details: toDelete,
  executed_at: new Date().toISOString()
});
```

## Security Notes

- Uses `SUPABASE_SERVICE_ROLE_KEY` for database access
- Edge function validates HTTP method (POST only)
- No sensitive data exposed in response
- Logs include cutoff date but not deleted record details
- Consider adding authentication to manual trigger endpoint

## Related Functions

- `check-in-reminder` - Sends reminder emails before check-in deadline
- `daily-check-in` - Notifies recipients when check-in deadline is missed
- `check-missed-checkins` - Identifies overdue check-ins

## Files

```
supabase/
├── functions/
│   └── cleanup-old-recipients/
│       └── index.ts (this edge function)
└── migrations/
    └── 20260602172021_schedule_cleanup_old_recipients.sql
```

## Frequently Asked Questions

**Q: What if I need to delete records older than 15 days but not all of them?**
A: Modify the `.lt()` filter condition to add additional `.and()` filters:
```typescript
.lt("notified_at", cutoffDateISO)
.neq("premium_email", null)  // Only premium users
```

**Q: Can I restore deleted records?**
A: By default, no. Enable Pitr (Point-in-Time Recovery) in Supabase settings to restore from backups.

**Q: How do I know if the cleanup ran?**
A: Check the function logs in Supabase Dashboard, or query the cron job history table.

**Q: Can I run this manually on demand?**
A: Yes, use the manual trigger curl command or create a POST endpoint in your API.
