import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Spectral } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const spectral = Spectral({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NaphtalAI — Freemasonic Research & Visual Connection Engine",
  description: "A research and investigation tool designed for ingesting large datasets, analyzing them with AI, and visually mapping connections on an infinite canvas.",
  keywords: ["NaphtalAI", "Freemasonry", "Research", "AI", "Visual Connections", "Canvas", "Knowledge Graph"],
  authors: [{ name: "NaphtalAI Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "NaphtalAI — Freemasonic Research Engine",
    description: "Discover hidden connections in historical documents",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${spectral.variable} antialiased bg-background text-foreground font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
