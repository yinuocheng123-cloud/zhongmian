import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import "./globals.css";

const portalSans = Noto_Sans_SC({
  variable: "--font-portal-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const portalSerif = Noto_Serif_SC({
  variable: "--font-portal-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "中眠网",
    template: "%s | 中眠网",
  },
  description: "中国睡眠产业的基础知识入口、信任入口与商业入口。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${portalSans.variable} ${portalSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
