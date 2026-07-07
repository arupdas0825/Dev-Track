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
      >
        <body className="min-h-full flex flex-col bg-background text-foreground font-inter">
          {children}
          <ThemeModal />
        </body>
      </html>
    </ThemeProvider>
  );
}
