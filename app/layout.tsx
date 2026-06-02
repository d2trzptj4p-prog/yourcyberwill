import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Cipherwill - Secure Digital Legacy",
  description: "Protect your most important information with end-to-end encrypted storage and secure sharing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeMode = process.env.NEXT_PUBLIC_THEME_MODE || "auto";
  const forceLight = themeMode === "light";

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased ${
        forceLight ? "light" : ""
      }`}
      style={forceLight ? { colorScheme: "light" } : {}}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-black text-black dark:text-white">
        {children}
      </body>
    </html>
  );
}
