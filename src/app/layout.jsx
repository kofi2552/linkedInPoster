import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import SessionWrapper from "@/components/SessionWrapper";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PostPilot",
  description: "Automate your LinkedIn posts with AI-generated content",
  generator: "PostPilot.app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SessionWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionWrapper>
        <Analytics />
      </body>
    </html>
  );
}
