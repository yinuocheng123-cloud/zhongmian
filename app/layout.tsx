/**
 * 文件说明：该文件实现中眠网应用根布局。
 * 功能说明：统一注入全局字体、根级 metadata 与页面基础结构。
 *
 * 结构概览：
 *   第一部分：导入依赖与字体配置
 *   第二部分：根级 metadata
 *   第三部分：RootLayout 实现
 */

import type { Metadata } from "next";
import { Noto_Sans_SC, Noto_Serif_SC } from "next/font/google";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
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
  metadataBase: SITE_URL,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    siteName: SITE_NAME,
    locale: "zh_CN",
    type: "website",
    url: "/",
    description: SITE_DESCRIPTION,
  },
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
