import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextWerk — Einkommen nach dem Job",
  description: "Mach aus deiner Automotive-Erfahrung neue Arbeit, bezahlte Projekte und gemeinsames Familieneinkommen.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="de"><body>{children}</body></html>;
}
