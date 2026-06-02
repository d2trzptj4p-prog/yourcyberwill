import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DAYS_TO_RETAIN = 15;

interface CleanupResult {
  deleted_count: number;
  error?: string;
  cutoff_date?: string;
  execution_time_ms: number;
}

async function cleanupOldRecipients(): Promise<CleanupResult> {
  const startTime = Date.now();

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
      },
    });

    // Calculate cutoff date: 15 days ago from now
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DAYS_TO_RETAIN);
    const cutoffDateISO = cutoffDate.toISOString();

    console.log(
      `Starting cleanup: deleting recipients notified before ${cutoffDateISO}`
    );

    // Delete recipients where notified_at is older than 15 days
    // Use .select("id") to return the deleted records so we can count them
    const { data, error } = await supabase
      .from("recipients")
      .delete()
      .lt("notified_at", cutoffDateISO)
      .select("id");

    if (error) {
      console.error("Error deleting recipients:", error);
      return {
        deleted_count: 0,
        error: error.message,
        execution_time_ms: Date.now() - startTime,
      };
    }

    // Count from returned data array (Supabase delete().select() returns deleted rows)
    const deletedCount = data?.length ?? 0;
    console.log(`Successfully deleted ${deletedCount} old recipient records`);

    return {
      deleted_count: deletedCount,
      cutoff_date: cutoffDateISO,
      execution_time_ms: Date.now() - startTime,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("Unexpected error during cleanup:", errorMsg);
    return {
      deleted_count: 0,
      error: errorMsg,
      execution_time_ms: Date.now() - startTime,
    };
  }
}

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const result = await cleanupOldRecipients();

  return new Response(JSON.stringify(result), {
    status: result.error ? 500 : 200,
    headers: { "Content-Type": "application/json" },
  });
});
