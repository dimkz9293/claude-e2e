import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Скоро запуск",
  description: "Залиште email, і ми повідомимо першими.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  );
}
