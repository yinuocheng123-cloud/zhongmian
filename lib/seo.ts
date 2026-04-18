/**
 * 文件说明：该文件实现中眠网前台页面共用的 SEO 元数据工具。
 * 功能说明：统一站点基础信息、canonical URL 生成、页面 metadata 结构与搜索页 noindex 策略。
 *
 * 结构概览：
 *   第一部分：站点基础常量
 *   第二部分：URL 归一化工具
 *   第三部分：页面 metadata 构建函数
 */

import type { Metadata } from "next";

export const SITE_NAME = "中眠网";
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.zhongmian.com",
);
export const SITE_DESCRIPTION =
  "中国睡眠产业的基础知识入口、信任入口与商业入口。";

function normalizePath(path: string) {
  if (!path || path === "/") {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

export function buildAbsoluteUrl(path: string) {
  return new URL(normalizePath(path), SITE_URL).toString();
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path,
  keywords,
  noIndex = false,
}: PageMetadataInput): Metadata {
  const canonical = buildAbsoluteUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "zh_CN",
      type: "website",
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
        }
      : undefined,
  };
}
