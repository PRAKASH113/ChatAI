import type { Metadata } from "next";
import { Poppins, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import GlobalWrapper from "@/components/GlobalWrapper";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const notoSansHindi = Noto_Sans_Devanagari({
  variable: "--font-hindi",
  subsets: ["devanagari", "latin"],
  display: "swap",
  preload: true,
  weight: ["400", "500", "700"],
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "ChatAI",
  description: "AI Powered Chatbot for all your needs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${notoSansHindi.variable} antialiased bg-background text-foreground`}
      >
        <GlobalWrapper>{children}</GlobalWrapper> {/* Main Layout is Wrapped under a Wrapper To add notifications funtionality */}
      </body>
    </html>
  );
}
