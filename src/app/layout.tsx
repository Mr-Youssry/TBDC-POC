import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TBDC Investor Matching POC",
  description:
    "Toronto Business Development Centre — portfolio companies × investor matchmaking. Weighted 16-point scoring across geography, stage, sector, revenue, cheque size, founder fit, and portfolio gap.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
