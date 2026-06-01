import { requireAuthUser } from "@/lib/api/auth";
import { enforceCheckInEditAllowed } from "@/lib/api/enforce-check-in-edit";
import {
  enforceFileUpload,
  getUserIsPremium,
} from "@/lib/api/tier-enforce";
import { parseFileMetaPayload } from "@/lib/api/vault-file-validation";
import { createClient } from "@/lib/supabase/server";
import { VAULT_FILES_BUCKET } from "@/lib/vault-storage";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vault_files")
    .select("*")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

/** Registers encrypted file metadata after client uploads ciphertext to Storage. */
export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const payload = parseFileMetaPayload(await request.json(), auth.user.id);
  if (!payload) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = await createClient();

  const checkInBlock = await enforceCheckInEditAllowed(supabase, auth.user.id);
  if (checkInBlock) {
    return checkInBlock;
  }

  const { data: existingObject, error: objectError } = await supabase.storage
    .from(VAULT_FILES_BUCKET)
    .download(payload.storage_path);

  if (objectError || !existingObject) {
    return NextResponse.json(
      { error: "Encrypted file not found in storage. Upload to Storage first." },
      { status: 400 },
    );
  }

  const fileBytes = existingObject.size;
  const isPremium = await getUserIsPremium(supabase, auth.user.id);
  const fileLimit = await enforceFileUpload(
    supabase,
    auth.user.id,
    isPremium,
    fileBytes,
  );
  if (fileLimit) {
    await supabase.storage
      .from(VAULT_FILES_BUCKET)
      .remove([payload.storage_path]);
    return fileLimit;
  }

  const { data, error } = await supabase
    .from("vault_files")
    .insert({
      id: payload.id,
      user_id: auth.user.id,
      storage_path: payload.storage_path,
      iv_file: payload.iv_file,
      encrypted_meta: payload.encrypted_meta,
      iv_meta: payload.iv_meta,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage
      .from(VAULT_FILES_BUCKET)
      .remove([payload.storage_path]);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
