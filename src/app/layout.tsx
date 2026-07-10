import type { Metadata } from "next";
import { Inter, Geist, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeContext";
import { ThemeModal } from "@/components/ui/ThemeModal";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dev-Track | Developer Intelligence Platform",
  description: "Dev-Track analyzes GitHub activity and transforms it into actionable developer intelligence. Understand your coding consistency, repository quality, strengths, and career trajectory.",
  keywords: ["GitHub analytics", "developer intelligence", "profile analysis", "coding metrics", "career insights"],
  icons: {
    icon: [
      { url: "/favicon.ico?v=1" },
      { url: "/favicon-16x16.png?v=1", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png?v=1", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png?v=1", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    title: "Dev-Track | Developer Intelligence Platform",
    description: "Dev-Track analyzes GitHub activity and transforms it into actionable developer intelligence.",
    images: [
      {
        url: "/og-image.png?v=1",
        width: 1200,
        height: 1200,
        alt: "Dev-Track Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <html
        lang="en"
        className={`${inter.variable} ${geist.variable} ${jetbrainsMono.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
          <link href="https://fonts.cdnfonts.com/css/object-sans" rel="stylesheet" />
        </head>
        <body className="min-h-full flex flex-col bg-background text-foreground font-inter">
          {children}
          <ThemeModal />
        </body>
      </html>
    </ThemeProvider>
  );
}
