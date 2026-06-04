import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // const themeMode = process.env.NEXT_PUBLIC_THEME_MODE || "auto";
  // const forceLight = themeMode === "light";

  return (
    <html
      lang="en"
      className={`${geistSans.className} ${geistMono.variable} h-full antialiased}`}
    >
      <Analytics />
      <SpeedInsights/>
      <head>
        <title>YourCyberWill | Open-Source Digital Dead Man's Switch</title>
<meta name="title" content="YourCyberWill | Open-Source Digital Dead Man's Switch" />
<meta name="description" content="Secure your digital legacy. Create an open-source, zero-knowledge encrypted vault for passwords and crypto keys that unlocks only if you go silent." />
<meta name="keywords" content="dead mans switch, digital will, crypto inheritance, digital asset legacy, inheritance vault, open source dead man switch, secure digital legacy" />
<meta name="robots" content="index, follow" />
<meta name="language" content="English" />

<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.yourcyberwill.com/" />
<meta property="og:title" content="YourCyberWill | Open-Source Digital Dead Man's Switch" />
<meta property="og:description" content="Secure your digital legacy. Create an open-source, zero-knowledge encrypted vault for passwords and crypto keys that unlocks only if you go silent." />
<meta property="og:image" content="https://www.yourcyberwill.com/og-image.png" />

<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content="https://www.yourcyberwill.com/" />
<meta property="twitter:title" content="YourCyberWill | Open-Source Digital Dead Man's Switch" />
<meta property="twitter:description" content="Secure your digital legacy. Create an open-source, zero-knowledge encrypted vault for passwords and crypto keys that unlocks only if you go silent." />
<meta property="twitter:image" content="https://www.yourcyberwill.com/og-image.png" />



<link rel="canonical" href="https://www.yourcyberwill.com/" />
<meta name="author" content="YourCyberWill Protocol" />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-black text-black dark:text-white">
        {children}
      </body>
    </html>
  );
}
