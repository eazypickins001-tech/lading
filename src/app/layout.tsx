import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lading - Every document, right the first time.",
    template: "%s · Lading",
  },
  description:
    "Lading captures a shipment once and generates compliant import and export documents, flags required permits, and catches consistency errors before submission.",
  metadataBase: new URL("https://lading.app"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cloud text-ink">
        {children}
      </body>
    </html>
  );
}
