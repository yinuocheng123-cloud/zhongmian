/**
 * 文件说明：该文件实现中眠网前台栏目页所需的服务端列表查询能力。
 * 功能说明：统一封装 /knowledge、/terms、/brands 三条主线路的已发布列表查询、最小搜索与空态兜底。
 *
 * 结构概览：
 *   第一部分：共享类型与数据库兜底
 *   第二部分：知识内容列表查询
 *   第三部分：词条列表查询
 *   第四部分：品牌列表查询
 */

import "server-only";

import {
  CategoryScope,
  ContentType,
  WorkflowStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

type QueryResult<T> = {
  data: T;
  error?: string;
  databaseReady: boolean;
};

type TaxonomyItem = {
  name: string;
  slug: string;
};

type QueryInput = {
  q?: string;
  take?: number;
};

export type KnowledgeListItem = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  contentType: ContentType;
  publishedAt: Date | null;
  updatedAt: Date;
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
};

export type TermListItem = {
  id: string;
  name: string;
  slug: string;
  shortDefinition: string | null;
  definition: string;
  updatedAt: Date;
  categories: TaxonomyItem[];
};

export type BrandListItem = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  summary: string | null;
  region: string | null;
  city: string | null;
  updatedAt: Date;
  categories: TaxonomyItem[];
};

export type ListCategoryCount = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

export type KnowledgeListData = {
  items: KnowledgeListItem[];
  query: string;
  limit: number;
};

export type TermsListData = {
  items: TermListItem[];
  categories: ListCategoryCount[];
  query: string;
  limit: number;
};

export type BrandsListData = {
  items: BrandListItem[];
  categories: ListCategoryCount[];
  query: string;
  limit: number;
};

const knowledgeTypes: ContentType[] = [
  ContentType.ARTICLE,
  ContentType.KNOWLEDGE,
  ContentType.TOPIC,
  ContentType.GUIDE,
  ContentType.REPORT,
  ContentType.THINK_TANK,
];

function getDatabaseUnavailableMessage() {
  if (!process.env.DATABASE_URL) {
    return "当前未配置 DATABASE_URL，前台栏目页暂时无法读取真实列表数据。";
  }

  return "数据库当前不可用，前台栏目页暂时无法读取真实列表数据。";
}

async function safeQuery<T>(fallback: T, query: () => Promise<T>) {
  if (!process.env.DATABASE_URL) {
    return {
      data: fallback,
      error: getDatabaseUnavailableMessage(),
      databaseReady: false,
    } satisfies QueryResult<T>;
  }

  try {
    return {
      data: await query(),
      databaseReady: true,
    } satisfies QueryResult<T>;
  } catch (error) {
    return {
      data: fallback,
      error: error instanceof Error ? error.message : "读取前台列表数据时发生未知错误。",
      databaseReady: false,
    } satisfies QueryResult<T>;
  }
}

function normalizeQuery(input?: string) {
  return input?.trim() ?? "";
}

function buildContains(input: string) {
  return {
    contains: input,
    mode: "insensitive" as const,
  };
}

export async function getPublishedKnowledgeList(input: QueryInput) {
  const query = normalizeQuery(input.q);
  const limit = input.take ?? 9;

  return safeQuery<KnowledgeListData>(
    {
      items: [],
      query,
      limit,
    },
    async () => {
      const items = await prisma.content.findMany({
        where: {
          workflowStatus: WorkflowStatus.PUBLISHED,
          contentType: {
            in: knowledgeTypes,
          },
          ...(query
            ? {
                OR: [
                  { title: buildContains(query) },
                  { slug: buildContains(query) },
                  { summary: buildContains(query) },
                ],
              }
            : {}),
        },
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          contentType: true,
          publishedAt: true,
          updatedAt: true,
          categories: {
            select: {
              name: true,
              slug: true,
            },
          },
          tags: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });

      return {
        items,
        query,
        limit,
      };
    },
  );
}

export async function getPublishedTermsList(input: QueryInput) {
  const query = normalizeQuery(input.q);
  const limit = input.take ?? 12;

  return safeQuery<TermsListData>(
    {
      items: [],
      categories: [],
      query,
      limit,
    },
    async () => {
      const [items, categories] = await Promise.all([
        prisma.term.findMany({
          where: {
            workflowStatus: WorkflowStatus.PUBLISHED,
            ...(query
              ? {
                  OR: [
                    { name: buildContains(query) },
                    { slug: buildContains(query) },
                    { shortDefinition: buildContains(query) },
                    { definition: buildContains(query) },
                  ],
                }
              : {}),
          },
          orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            shortDefinition: true,
            definition: true,
            updatedAt: true,
            categories: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        }),
        prisma.category.findMany({
          where: {
            scope: CategoryScope.TERM,
            terms: {
              some: {
                workflowStatus: WorkflowStatus.PUBLISHED,
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                terms: {
                  where: {
                    workflowStatus: WorkflowStatus.PUBLISHED,
                  },
                },
              },
            },
          },
        }),
      ]);

      return {
        items,
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: category._count.terms,
        })),
        query,
        limit,
      };
    },
  );
}

export async function getPublishedBrandsList(input: QueryInput) {
  const query = normalizeQuery(input.q);
  const limit = input.take ?? 9;

  return safeQuery<BrandsListData>(
    {
      items: [],
      categories: [],
      query,
      limit,
    },
    async () => {
      const [items, categories] = await Promise.all([
        prisma.brand.findMany({
          where: {
            workflowStatus: WorkflowStatus.PUBLISHED,
            ...(query
              ? {
                  OR: [
                    { name: buildContains(query) },
                    { slug: buildContains(query) },
                    { summary: buildContains(query) },
                    { tagline: buildContains(query) },
                    { region: buildContains(query) },
                    { city: buildContains(query) },
                  ],
                }
              : {}),
          },
          orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
          take: limit,
          select: {
            id: true,
            name: true,
            slug: true,
            tagline: true,
            summary: true,
            region: true,
            city: true,
            updatedAt: true,
            categories: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        }),
        prisma.category.findMany({
          where: {
            scope: CategoryScope.BRAND,
            brands: {
              some: {
                workflowStatus: WorkflowStatus.PUBLISHED,
              },
            },
          },
          orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                brands: {
                  where: {
                    workflowStatus: WorkflowStatus.PUBLISHED,
                  },
                },
              },
            },
          },
        }),
      ]);

      return {
        items,
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: category._count.brands,
        })),
        query,
        limit,
      };
    },
  );
}
