import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "TBDC Investor Matching POC",
  description:
    "Toronto Business Development Centre — portfolio companies × investor matchmaking. Weighted 16-point scoring across geography, stage, sector, revenue, cheque size, founder fit, and portfolio gap.",
  icons: {
    icon: "/favicon.ico",
    apple: "/tbdc-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`h-full antialiased ${plusJakartaSans.variable}`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
