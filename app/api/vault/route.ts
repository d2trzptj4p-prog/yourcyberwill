import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Returns vault salt for client-side key derivation. */
export async function GET() {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("crypto_salt, password_verifier_ciphertext, password_verifier_iv")
    .eq("id", auth.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const hasVerifier =
    profile?.password_verifier_ciphertext && profile?.password_verifier_iv;

  return NextResponse.json({
    crypto_salt: profile?.crypto_salt ?? null,
    password_verifier: hasVerifier
      ? {
          ciphertext: profile.password_verifier_ciphertext,
          iv: profile.password_verifier_iv,
        }
      : null,
  });
}
