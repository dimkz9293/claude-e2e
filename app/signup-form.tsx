"use client";

import { useActionState, useEffect } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { signup } from "./actions";
import styles from "./page.module.css";

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, null);

  useEffect(() => {
    if (state?.ok && process.env.NEXT_PUBLIC_GA_ID) sendGAEvent("event", "sign_up", { method: "email" });
  }, [state]);

  if (state?.ok) return <p className={styles.lead}>{state.message}</p>;

  return (
    <>
      <form action={action} className={styles.form}>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          aria-label="Email"
          className={styles.input}
        />
        <button type="submit" disabled={pending} className={styles.button}>
          Підписатися
        </button>
      </form>
      {state && <p role="alert" className={styles.error}>{state.message}</p>}
    </>
  );
}
