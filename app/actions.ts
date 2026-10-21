"use server";

import postgres from "postgres";

export type SignupState = { ok: boolean; message: string } | null;

let sql: postgres.Sql | undefined;

export async function signup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Введіть коректний email." };
  }

  sql ??= postgres(process.env.DATABASE_URL!, { max: 1 });
  try {
    await sql`insert into signups (email) values (${email}) on conflict (email) do nothing`;
  } catch (error) {
    console.error("signup failed", error);
    return { ok: false, message: "Не вдалося зберегти. Спробуйте пізніше." };
  }
  return { ok: true, message: "Дякуємо! Ми повідомимо вас першими." };
}
