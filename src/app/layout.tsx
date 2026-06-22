import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/ui/ThemeContext";
import ThemeSettingsModal from "@/components/ui/ThemeSettingsModal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
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
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-inter">
        <ThemeProvider>
          {children}
          <ThemeSettingsModal />
        </ThemeProvider>
      </body>
    </html>
  );
}
