import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextWerk — İşten sonraki hayat için gelir altyapısı",
  description: "Otomotiv deneyimini yeni bir işe, ücretli projeye veya ailece büyüyen bir gelire dönüştür.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="tr"><body>{children}</body></html>;
}
