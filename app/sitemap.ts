/**
 * 文件说明：该文件实现中眠网前台站点地图。
 * 功能说明：输出静态栏目页与已发布 Content / Term / Brand 详情页，供搜索引擎抓取公开路径。
 *
 * 结构概览：
 *   第一部分：导入依赖与静态路由定义
 *   第二部分：工具函数
 *   第三部分：sitemap 生成逻辑
 */

import type { MetadataRoute } from "next";
import { WorkflowStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildAbsoluteUrl } from "@/lib/seo";

const staticRoutes = [
  { path: "/", priority: 1, changeFrequency: "daily" as const },
  { path: "/knowledge", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/terms", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/brands", priority: 0.85, changeFrequency: "weekly" as const },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
];

function createEntry(
  path: string,
  options?: {
    lastModified?: Date;
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
  },
): MetadataRoute.Sitemap[number] {
  return {
    url: buildAbsoluteUrl(path),
    lastModified: options?.lastModified,
    changeFrequency: options?.changeFrequency,
    priority: options?.priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = staticRoutes.map((route) =>
    createEntry(route.path, {
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }),
  );

  // 数据库尚未配置时仅输出静态公开路径，避免 sitemap 直接报错。
  if (!process.env.DATABASE_URL) {
    return entries;
  }

  try {
    const [contents, terms, brands] = await Promise.all([
      prisma.content.findMany({
        where: {
          workflowStatus: WorkflowStatus.PUBLISHED,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
      prisma.term.findMany({
        where: {
          workflowStatus: WorkflowStatus.PUBLISHED,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
      prisma.brand.findMany({
        where: {
          workflowStatus: WorkflowStatus.PUBLISHED,
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      }),
    ]);

    return [
      ...entries,
      ...contents.map((item) =>
        createEntry(`/knowledge/${item.slug}`, {
          lastModified: item.updatedAt,
          changeFrequency: "weekly",
          priority: 0.8,
        }),
      ),
      ...terms.map((item) =>
        createEntry(`/terms/${item.slug}`, {
          lastModified: item.updatedAt,
          changeFrequency: "weekly",
          priority: 0.75,
        }),
      ),
      ...brands.map((item) =>
        createEntry(`/brands/${item.slug}`, {
          lastModified: item.updatedAt,
          changeFrequency: "weekly",
          priority: 0.7,
        }),
      ),
    ];
  } catch {
    return entries;
  }
}
