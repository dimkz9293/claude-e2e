import { SignupForm } from "./signup-form";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Скоро запуск</h1>
      <p className={styles.lead}>Залиште email, і ми повідомимо першими.</p>
      <SignupForm />
    </main>
  );
}
