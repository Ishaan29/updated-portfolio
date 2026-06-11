import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import Navigation from "./components/Navigation";
import ThemeProvider from "./components/ThemeProvider";
import SmoothScroll from "./components/SmoothScroll";
import AnalyticsInitializer from "./components/AnalyticsInitializer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "Eshaan Bajpai | Backend Software Engineer",
  description: "Portfolio of Eshaan Bajpai, a Backend Software Engineer specializing in distributed systems and high-scale data processing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased selection:bg-accent selection:text-bg">
        <ThemeProvider forcedTheme="amber">
          <SmoothScroll>
            <AnalyticsInitializer />
            {children}
          </SmoothScroll>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
