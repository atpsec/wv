import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATP Privacy Tools",
  description: "Basit, hızlı ve güvenli bağlantı araçları.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}
