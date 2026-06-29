import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Azure Data Engineering Bible 2026 | Learn Azure DE",
    template: "%s | Azure DE Bible",
  },
  description: "The complete industry-grade Azure Data Engineering learning platform. 10 phases, 300+ interview questions, 10 production projects, 4 certifications. Go from beginner to Senior Azure Data Engineer.",
  keywords: ["Azure Data Engineering", "ADF", "Databricks", "Delta Lake", "Apache Spark", "DP-203", "Azure Synapse", "Data Engineering Interview", "Azure Data Factory"],
  openGraph: {
    title: "Azure Data Engineering Bible 2026",
    description: "The complete learning platform for Azure Data Engineers",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar />
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
