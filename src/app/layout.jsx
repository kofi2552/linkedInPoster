import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "LinkedIn Content Scheduler",
  description: "Automate your LinkedIn posts with AI-generated content",
  generator: "v0.app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <SessionWrapper>{children}</SessionWrapper>
        <Analytics />
      </body>
    </html>
  );
}
