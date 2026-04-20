import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import { StoreProvider } from "@/context/StoreContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import ClientLayout from "@/components/layout/ClientLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multi-Store OMS",
  description: "Order Management System",
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
      <body className="min-h-full flex flex-col">
        <ReactQueryProvider>
          <StoreProvider>
            <TooltipProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </TooltipProvider>
          </StoreProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
