import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/MainLayout";

export const metadata: Metadata = {
  title: "LavaMesh Dashboard",
  description: "Network Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#000000] text-[#EDEDED] font-sans antialiased selection:bg-orange-500/30 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
