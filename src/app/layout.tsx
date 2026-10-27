import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Techievo LMS | Learning Operations",
  description: "Techievo learning operations and project review platform.",
  applicationName: "Techievo LMS",
  icons: { icon: "/brand/Favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
