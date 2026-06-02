import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
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
    const { error, count } = await supabase
      .from("recipients")
      .delete()
      .lt("notified_at", cutoffDateISO)
      .select("id", { count: "exact" });

    if (error) {
      console.error("Error deleting recipients:", error);
      return {
        deleted_count: 0,
        error: error.message,
        execution_time_ms: Date.now() - startTime,
      };
    }

    const deletedCount = count ?? 0;
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

export async function POST() {
  try {
    const result = await cleanupOldRecipients();

    return Response.json(result, {
      status: result.error ? 500 : 200,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("API error:", errorMsg);

    return Response.json(
      {
        deleted_count: 0,
        error: errorMsg,
        execution_time_ms: 0,
      },
      { status: 500 }
    );
  }
}
