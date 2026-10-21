import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

// Set only in Vercel Production, so stage, previews and local send nothing to GA.
const gaId = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  title: "Скоро запуск",
  description: "Залиште email, і ми повідомимо першими.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk">
      <body>{children}</body>
      {gaId && <GoogleAnalytics gaId={gaId} />}
    </html>
  );
}
