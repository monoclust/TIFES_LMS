import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Techievo LMS | Learning Operations",
  description: "Techievo learning operations and project review platform.",
  applicationName: "Techievo LMS",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
