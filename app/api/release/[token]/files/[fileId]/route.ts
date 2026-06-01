import { getReleasedRecipientByToken } from "@/lib/release-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { VAULT_FILES_BUCKET } from "@/lib/vault-storage";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ token: string; fileId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token, fileId } = await context.params;
  const recipient = await getReleasedRecipientByToken(token);

  if (!recipient) {
    return NextResponse.json(
      { error: "Invalid or inactive release link" },
      { status: 404 },
    );
  }

  const supabase = createAdminClient();
  const { data: fileRow, error: fileError } = await supabase
    .from("vault_files")
    .select("storage_path")
    .eq("id", fileId)
    .eq("user_id", recipient.user_id)
    .maybeSingle();

  if (fileError || !fileRow) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const { data: blob, error: downloadError } = await supabase.storage
    .from(VAULT_FILES_BUCKET)
    .download(fileRow.storage_path);

  if (downloadError || !blob) {
    return NextResponse.json(
      { error: downloadError?.message ?? "Download failed" },
      { status: 500 },
    );
  }

  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return NextResponse.json({
    ciphertext_base64: btoa(binary),
  });
}
