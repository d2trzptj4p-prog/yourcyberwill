import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const ciphertext =
    body && typeof body.ciphertext === "string" ? body.ciphertext.trim() : "";
  const iv = body && typeof body.iv === "string" ? body.iv.trim() : "";

  if (!ciphertext || !iv) {
    return NextResponse.json({ error: "Invalid verifier" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("password_verifier_ciphertext")
    .eq("id", auth.user.id)
    .single();

  if (profile?.password_verifier_ciphertext) {
    return NextResponse.json(
      { error: "Verifier already configured" },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      password_verifier_ciphertext: ciphertext,
      password_verifier_iv: iv,
    })
    .eq("id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
