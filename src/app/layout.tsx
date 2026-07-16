import type { Metadata } from "next";
import { IBM_Plex_Sans, Inter, IBM_Plex_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ui/ThemeContext";
import { ThemeModal } from "@/components/ui/ThemeModal";
import { AuthModalProvider } from "@/components/auth/AuthModalContext";
import "./globals.css";

const displayFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased`}
        suppressHydrationWarning
      >
        <head>
        </head>
        <body className="min-h-full flex flex-col bg-background text-foreground font-inter">
          <AuthModalProvider>
            {children}
            <ThemeModal />
          </AuthModalProvider>
        </body>
      </html>
    </ThemeProvider>
  );
}
