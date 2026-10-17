import type { Metadata } from "next";
import { JetBrains_Mono, Playfair_Display, Kalam, Patrick_Hand } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500", "600"],
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["700", "800", "900"],
});

const kalam = Kalam({
  subsets: ["latin"],
  variable: "--font-hand",
  weight: ["400", "700"],
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-note",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Daily Nodes — Log your day, share your world",
  description:
    "A minimal life-logging app for tracking what matters — workouts, food, moods, and more. Share moments with your close circle and get AI-powered daily digests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${jetbrainsMono.variable} ${playfairDisplay.variable} ${kalam.variable} ${patrickHand.variable}`}
      >
        <body className="min-h-screen bg-background text-foreground antialiased" suppressHydrationWarning>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
