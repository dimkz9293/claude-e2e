"use server";

import { headers } from "next/headers";
import postgres from "postgres";

export type SignupState = { ok: boolean; message: string } | null;

const INVALID_EMAIL = "Введіть коректний email.";
const SAVE_FAILED = "Не вдалося зберегти. Спробуйте пізніше.";

let sql: postgres.Sql | undefined;

export async function signup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: INVALID_EMAIL };
  }

  // Production sets both HubSpot variables; stage and local leave them unset and write to Neon.
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formId = process.env.HUBSPOT_FORM_ID;
  try {
    if (portalId && formId) {
      const error = await submitToHubSpot(portalId, formId, email);
      if (error) return { ok: false, message: error };
    } else {
      sql ??= postgres(process.env.DATABASE_URL!, { max: 1 });
      await sql`insert into signups (email) values (${email}) on conflict (email) do nothing`;
    }
  } catch (error) {
    console.error("signup failed", error);
    return { ok: false, message: SAVE_FAILED };
  }
  return { ok: true, message: "Дякуємо! Ми повідомимо вас першими." };
}

// HubSpot Forms API (unauthenticated): creates or updates the contact by email.
// Returns a message for the visitor when HubSpot rejects the email, throws on anything else.
async function submitToHubSpot(portalId: string, formId: string, email: string) {
  const pageUri = (await headers()).get("referer") ?? undefined;
  const res = await fetch(
    `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: [{ objectTypeId: "0-1", name: "email", value: email }],
        context: { pageUri, pageName: "Скоро запуск" },
      }),
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (res.ok) return null;

  const body = await res.text();
  if (res.status === 400 && /"errorType":"(INVALID_EMAIL|BLOCKED_EMAIL)"/.test(body)) {
    return INVALID_EMAIL;
  }
  throw new Error(`HubSpot responded ${res.status}: ${body}`);
}
