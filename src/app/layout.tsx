import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MiniShop - E-commerce Store",
  description: "Modern e-commerce store built with Next.js, featuring a wide selection of tech products.",
  keywords: ["e-commerce", "shopping", "online store", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui"],
  authors: [{ name: "MiniShop Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "MiniShop - E-commerce Store",
    description: "Modern e-commerce store with premium tech products",
    url: "http://localhost:3000",
    siteName: "MiniShop",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MiniShop - E-commerce Store",
    description: "Modern e-commerce store with premium tech products",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
