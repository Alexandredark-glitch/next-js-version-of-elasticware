import type { Metadata } from "next";

import {
  Inter,
  Fraunces,
  Bungee,
  JetBrains_Mono,
} from "next/font/google";

import { Analytics } from "@vercel/analytics/react";

import Providers from "./providers";
import "./globals.css";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  fallback: ["system-ui", "sans-serif"],
  display: "optional",
});

const fontHeading = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  fallback: ["Georgia", "serif"],
  weight: ["400", "600", "700", "900"],
  display: "optional",
});

const fontDisplay = Bungee({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
  fallback: ["Arial Narrow", "sans-serif"],
  display: "optional",
});

const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  fallback: ["monospace"],
  weight: ["400", "700"],
  display: "optional",
});

export const metadata: Metadata = {
  title: "Elasticware",
  description: "Elasticware is a modern support ticket management system designed to streamline customer support operations. It offers a user-friendly interface, powerful features, and seamless integration with your existing tools.",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontHeading.variable} ${fontDisplay.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-charcoal-900 font-sans">
        <Providers>{children}</Providers>

        <Analytics />
      </body>
    </html>
  );
}