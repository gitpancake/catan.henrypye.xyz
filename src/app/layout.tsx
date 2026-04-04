import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import AuthGate from "@/components/auth-gate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "catan. — Settlers of Catan Leaderboard",
    template: "%s | catan.",
  },
  description:
    "Track games. Rank players. Settle the score. A Settlers of Catan leaderboard and game tracker.",
  metadataBase: new URL("https://catan.henrypye.xyz"),
  openGraph: {
    title: "catan. — Settlers of Catan Leaderboard",
    description:
      "Track games. Rank players. Settle the score. A Settlers of Catan leaderboard and game tracker.",
    siteName: "catan.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "catan. — Settlers of Catan Leaderboard",
    description:
      "Track games. Rank players. Settle the score. A Settlers of Catan leaderboard and game tracker.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark">
          <AuthGate>{children}</AuthGate>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
