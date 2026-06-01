import { requireAuthUser } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  const auth = await requireAuthUser();
  if (auth instanceof NextResponse) {
    return auth;
  }

  const body = await request.json();
  const crypto_salt =
    body && typeof body.crypto_salt === "string" ? body.crypto_salt.trim() : "";

  if (!crypto_salt) {
    return NextResponse.json({ error: "Invalid salt" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("crypto_salt")
    .eq("id", auth.user.id)
    .single();

  if (profile?.crypto_salt) {
    return NextResponse.json(
      { error: "Salt already configured" },
      { status: 409 },
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ crypto_salt })
    .eq("id", auth.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ crypto_salt });
}
