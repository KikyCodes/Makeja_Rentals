import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Handles:
 * 1. OAuth redirect (Google) — `code` param present
 * 2. Magic-link / email confirmation — `token_hash` + `type` params present
 * 3. Fragment-based tokens (#access_token=...) — handled client-side; server
 *    just needs a landing page for that. We detect missing params and redirect
 *    to a client-side handler page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "email"
    | "recovery"
    | "email_change"
    | "signup"
    | null;
  const next = searchParams.get("next") ?? "/dashboard";
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  // Surface errors passed through from Supabase OAuth
  if (errorParam) {
    const msg = errorDescription
      ? encodeURIComponent(errorDescription)
      : encodeURIComponent(errorParam);
    return NextResponse.redirect(`${origin}/auth/login?error=${msg}`);
  }

  const supabase = await createClient();

  // ── 1. OAuth code exchange ──────────────────────────────────────────────────
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(
        `${origin}/auth/login?error=${encodeURIComponent(error.message)}`
      );
    }

    const user = data?.user;
    if (user) {
      // Ensure profile row exists (upsert is idempotent)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? "",
            full_name:
              user.user_metadata?.full_name ??
              user.user_metadata?.name ??
              null,
            avatar_url: user.user_metadata?.avatar_url ?? null,
            role: user.user_metadata?.role ?? "tenant",
          },
          { onConflict: "id", ignoreDuplicates: true }
        );

      if (profileError) {
        // Non-fatal: log and continue
        console.error("[auth/callback] profile upsert error:", profileError.message);
      }
    }

    return NextResponse.redirect(`${origin}${next}`);
  }

  // ── 2. Token-hash verification (magic link / email confirmation) ───────────
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (error) {
      return NextResponse.redirect(
        `${origin}/auth/verify-email?error=${encodeURIComponent(error.message)}`
      );
    }

    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/auth/reset-password`);
    }

    // Email confirmed — show success page with redirect
    return NextResponse.redirect(
      `${origin}/auth/verify-email?verified=true&next=${encodeURIComponent(next)}`
    );
  }

  // ── 3. No recognizable params — likely a fragment-based redirect ───────────
  // The browser strips # fragments before sending to server. We send to a
  // client-side page that reads the fragment and calls supabase.auth.getSession().
  return NextResponse.redirect(`${origin}/auth/verify-email?error=invalid_link`);
}
