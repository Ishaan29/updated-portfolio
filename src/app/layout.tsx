import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Navigation from "./components/Navigation";
import MouseGradient from "./components/MouseGradient";
import ThemeProvider from "./components/ThemeProvider";
import ThemeToggle from "./components/ThemeToggle";
import SmoothScroll from "./components/SmoothScroll";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-navy text-slate antialiased selection:bg-green selection:text-navy`}
      >
        <ThemeProvider>
          <SmoothScroll>
            <MouseGradient />
            <ThemeToggle />
            {children}
          </SmoothScroll>
        </ThemeProvider>
      </body>
    </html>
  );
}
