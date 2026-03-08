import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Doto } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "Devark  - The fastest way to build your backend",
    template: "%s | Debark",
  },
  description:
    "Build production-ready backends with one command. Get authentication, payments, database, and more - all configured and ready to deploy.",
  keywords: [
    "backend development",
    "rapid prototyping",
    "authentication",
    "payments",
    "database",
    "API development",
    "full-stack",
    "developer tools",
  ],
  authors: [{ name: "huzfm", url: "https://huzfm.vercel.app" }],
  creator: "huzfm",
  publisher: "Devark",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://devarkfe.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devarkfe.vercel.app",
    title: "Devark - The fastest way to build your backend",
    description:
      "Build production-ready backends with one command. Get authentication, payments, database, and more - all configured and ready to deploy.",
    siteName: "BuildFast",
    images: [
      {
        url: "/metadata.png",
        width: 1200,
        height: 630,
        alt: "BuildFast - Backend Development Tool",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Devark - The fastest way to build your backend",
    description:
      "Build production-ready backends with one command. Get authentication, payments, database, and more - all configured and ready to deploy.",
    images: ["https://devarkfe.vercel.app/metadata.png"],
    creator: "@huzfm",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={doto.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${doto.variable} antialiased`}
      >
        {/* <div className="absolute inset-0 bg-grid -z-10"></div> */}
        {children}
        <Analytics />
      </body>
    </html>
  );
}
