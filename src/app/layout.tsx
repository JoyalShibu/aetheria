import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import CanvasBackground from "@/components/CanvasBackground";
import GlobalErrorSuppressor from "@/components/GlobalErrorSuppressor";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aetheria | Anti-Gravity Streaming",
  description: "Next-generation streaming platform with an anti-gravity UX.",
};

import { ProfileProvider } from "@/components/ProfileProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans relative">
        <ProfileProvider>
          <GlobalErrorSuppressor />
          <CanvasBackground />
          {children}
        </ProfileProvider>
      </body>
    </html>
  );
}
