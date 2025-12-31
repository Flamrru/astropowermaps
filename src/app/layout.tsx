import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import MetaPixel from "@/components/MetaPixel";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "2026 Power Map | Discover Your Year",
  description: "Based on your birth chart, there's a map for your year. Discover your 3 power months and 3 power destinations for 2026.",
  openGraph: {
    title: "2026 Power Map | Discover Your Year",
    description: "Based on your birth chart, there's a map for your year. Most people never see it.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#050510",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Preload background images to prevent transition lag */}
        <link rel="preload" href="/question-bg.webp" as="image" type="image/webp" />
        <link rel="preload" href="/globe-bg.webp" as="image" type="image/webp" />
        <link rel="preload" href="/nebula-mobile.webp" as="image" type="image/webp" />
        <link rel="preload" href="/nebula-desktop.webp" as="image" type="image/webp" />
        {/* Preload testimonial face for instant display */}
        <link rel="preload" href="/testimonial-face.png" as="image" type="image/png" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} antialiased`}>
        <MetaPixel />
        {children}
      </body>
    </html>
  );
}
