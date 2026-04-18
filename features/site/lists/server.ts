/**
 * 文件说明：该文件实现中眠网前台栏目页所需的服务端列表查询能力。
 * 功能说明：统一封装 /knowledge、/terms、/brands 三条主线路的已发布列表查询、最小搜索、分类筛选、标签筛选与分页。
 *
 * 结构概览：
 *   第一部分：共享类型、分页结构与数据库兜底
 *   第二部分：知识内容列表查询
 *   第三部分：词条列表查询
 *   第四部分：品牌列表查询
 */

import "server-only";

import {
  CategoryScope,
  ContentType,
  WorkflowStatus,
  type Prisma,
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
  category?: string;
  tag?: string;
  page?: string | number;
  take?: number;
};

type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
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
  tags: TaxonomyItem[];
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
  tags: TaxonomyItem[];
};

export type ListCategoryCount = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

export type ListTagCount = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

export type KnowledgeListData = {
  items: KnowledgeListItem[];
  categories: ListCategoryCount[];
  tags: ListTagCount[];
  query: string;
  activeCategory: string;
  activeTag: string;
  pagination: PaginationState;
};

export type TermsListData = {
  items: TermListItem[];
  categories: ListCategoryCount[];
  tags: ListTagCount[];
  query: string;
  activeCategory: string;
  activeTag: string;
  pagination: PaginationState;
};

export type BrandsListData = {
  items: BrandListItem[];
  categories: ListCategoryCount[];
  tags: ListTagCount[];
  query: string;
  activeCategory: string;
  activeTag: string;
  pagination: PaginationState;
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

function normalizePage(input?: string | number) {
  const page = Number(input);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function buildContains(input: string) {
  return {
    contains: input,
    mode: "insensitive" as const,
  };
}

function buildPagination(total: number, page: number, pageSize: number): PaginationState {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);

  return {
    page: safePage,
    pageSize,
    total,
    totalPages,
  };
}

function buildKnowledgeWhere(input: {
  query: string;
  category: string;
  tag: string;
}): Prisma.ContentWhereInput {
  return {
    workflowStatus: WorkflowStatus.PUBLISHED,
    contentType: {
      in: knowledgeTypes,
    },
    ...(input.query
      ? {
          OR: [
            { title: buildContains(input.query) },
            { slug: buildContains(input.query) },
            { summary: buildContains(input.query) },
          ],
        }
      : {}),
    ...(input.category
      ? {
          categories: {
            some: {
              slug: input.category,
            },
          },
        }
      : {}),
    ...(input.tag
      ? {
          tags: {
            some: {
              slug: input.tag,
            },
          },
        }
      : {}),
  };
}

function buildTermWhere(input: {
  query: string;
  category: string;
  tag: string;
}): Prisma.TermWhereInput {
  return {
    workflowStatus: WorkflowStatus.PUBLISHED,
    ...(input.query
      ? {
          OR: [
            { name: buildContains(input.query) },
            { slug: buildContains(input.query) },
            { shortDefinition: buildContains(input.query) },
            { definition: buildContains(input.query) },
          ],
        }
      : {}),
    ...(input.category
      ? {
          categories: {
            some: {
              slug: input.category,
            },
          },
        }
      : {}),
    ...(input.tag
      ? {
          tags: {
            some: {
              slug: input.tag,
            },
          },
        }
      : {}),
  };
}

function buildBrandWhere(input: {
  query: string;
  category: string;
  tag: string;
}): Prisma.BrandWhereInput {
  return {
    workflowStatus: WorkflowStatus.PUBLISHED,
    ...(input.query
      ? {
          OR: [
            { name: buildContains(input.query) },
            { slug: buildContains(input.query) },
            { summary: buildContains(input.query) },
            { tagline: buildContains(input.query) },
            { region: buildContains(input.query) },
            { city: buildContains(input.query) },
          ],
        }
      : {}),
    ...(input.category
      ? {
          categories: {
            some: {
              slug: input.category,
            },
          },
        }
      : {}),
    ...(input.tag
      ? {
          tags: {
            some: {
              slug: input.tag,
            },
          },
        }
      : {}),
  };
}

export async function getPublishedKnowledgeList(input: QueryInput) {
  const query = normalizeQuery(input.q);
  const activeCategory = normalizeQuery(input.category);
  const activeTag = normalizeQuery(input.tag);
  const pageSize = input.take ?? 9;
  const requestedPage = normalizePage(input.page);

  return safeQuery<KnowledgeListData>(
    {
      items: [],
      categories: [],
      tags: [],
      query,
      activeCategory,
      activeTag,
      pagination: buildPagination(0, 1, pageSize),
    },
    async () => {
      const where = buildKnowledgeWhere({
        query,
        category: activeCategory,
        tag: activeTag,
      });

      const [total, categories, tags] = await Promise.all([
        prisma.content.count({ where }),
        prisma.category.findMany({
          where: {
            scope: CategoryScope.CONTENT,
            contents: {
              some: {
                workflowStatus: WorkflowStatus.PUBLISHED,
                contentType: {
                  in: knowledgeTypes,
                },
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
                contents: {
                  where: {
                    workflowStatus: WorkflowStatus.PUBLISHED,
                    contentType: {
                      in: knowledgeTypes,
                    },
                  },
                },
              },
            },
          },
        }),
        prisma.tag.findMany({
          where: {
            contents: {
              some: {
                workflowStatus: WorkflowStatus.PUBLISHED,
                contentType: {
                  in: knowledgeTypes,
                },
              },
            },
          },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            slug: true,
            _count: {
              select: {
                contents: {
                  where: {
                    workflowStatus: WorkflowStatus.PUBLISHED,
                    contentType: {
                      in: knowledgeTypes,
                    },
                  },
                },
              },
            },
          },
          take: 12,
        }),
      ]);

      const pagination = buildPagination(total, requestedPage, pageSize);
      const items = await prisma.content.findMany({
        where,
        orderBy: [{ publishedAt: "desc" }, { updatedAt: "desc" }],
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
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
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: category._count.contents,
        })),
        tags: tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          count: tag._count.contents,
        })),
        query,
        activeCategory,
        activeTag,
        pagination,
      };
    },
  );
}

export async function getPublishedTermsList(input: QueryInput) {
  const query = normalizeQuery(input.q);
  const activeCategory = normalizeQuery(input.category);
  const activeTag = normalizeQuery(input.tag);
  const pageSize = input.take ?? 12;
  const requestedPage = normalizePage(input.page);

  return safeQuery<TermsListData>(
    {
      items: [],
      categories: [],
      tags: [],
      query,
      activeCategory,
      activeTag,
      pagination: buildPagination(0, 1, pageSize),
    },
    async () => {
      const where = buildTermWhere({
        query,
        category: activeCategory,
        tag: activeTag,
      });

      const [total, categories, tags] = await Promise.all([
        prisma.term.count({ where }),
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
        prisma.tag.findMany({
          where: {
            terms: {
              some: {
                workflowStatus: WorkflowStatus.PUBLISHED,
              },
            },
          },
          orderBy: { name: "asc" },
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
          take: 12,
        }),
      ]);

      const pagination = buildPagination(total, requestedPage, pageSize);
      const items = await prisma.term.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
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
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: category._count.terms,
        })),
        tags: tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          count: tag._count.terms,
        })),
        query,
        activeCategory,
        activeTag,
        pagination,
      };
    },
  );
}

export async function getPublishedBrandsList(input: QueryInput) {
  const query = normalizeQuery(input.q);
  const activeCategory = normalizeQuery(input.category);
  const activeTag = normalizeQuery(input.tag);
  const pageSize = input.take ?? 9;
  const requestedPage = normalizePage(input.page);

  return safeQuery<BrandsListData>(
    {
      items: [],
      categories: [],
      tags: [],
      query,
      activeCategory,
      activeTag,
      pagination: buildPagination(0, 1, pageSize),
    },
    async () => {
      const where = buildBrandWhere({
        query,
        category: activeCategory,
        tag: activeTag,
      });

      const [total, categories, tags] = await Promise.all([
        prisma.brand.count({ where }),
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
        prisma.tag.findMany({
          where: {
            brands: {
              some: {
                workflowStatus: WorkflowStatus.PUBLISHED,
              },
            },
          },
          orderBy: { name: "asc" },
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
          take: 12,
        }),
      ]);

      const pagination = buildPagination(total, requestedPage, pageSize);
      const items = await prisma.brand.findMany({
        where,
        orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
        skip: (pagination.page - 1) * pagination.pageSize,
        take: pagination.pageSize,
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
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: category._count.brands,
        })),
        tags: tags.map((tag) => ({
          id: tag.id,
          name: tag.name,
          slug: tag.slug,
          count: tag._count.brands,
        })),
        query,
        activeCategory,
        activeTag,
        pagination,
      };
    },
  );
}
