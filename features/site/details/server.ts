/**
 * 文件说明：该文件实现中眠网前台详情页所需的服务端查询能力。
 * 功能说明：统一封装 Content / Term / Brand 的已发布详情查询、关联信息查询与数据库不可用兜底。
 *
 * 结构概览：
 *   第一部分：共享类型与数据库兜底
 *   第二部分：Content 详情查询
 *   第三部分：Term 详情查询
 *   第四部分：Brand 详情查询
 */

import "server-only";

import { WorkflowStatus, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type DetailResult<T> = {
  data: T | null;
  error?: string;
  databaseReady: boolean;
};

type TaxonomyItem = {
  name: string;
  slug: string;
};

type TaxonomyWithId = TaxonomyItem & {
  id: string;
};

type TagWithId = {
  id: string;
  name: string;
  slug: string;
};

export type ContentDetail = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  body: string | null;
  contentType: string;
  publishedAt: Date | null;
  updatedAt: Date;
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
  relatedTerms: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  relatedBrands: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  relatedContents: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    publishedAt: Date | null;
  }>;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type TermDetail = {
  id: string;
  name: string;
  slug: string;
  shortDefinition: string | null;
  definition: string;
  body: string | null;
  updatedAt: Date;
  categories: TaxonomyItem[];
  relatedTerms: Array<{
    id: string;
    name: string;
    slug: string;
    shortDefinition: string | null;
  }>;
  relatedContents: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string | null;
  }>;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type BrandDetail = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  summary: string | null;
  description: string | null;
  website: string | null;
  region: string | null;
  city: string | null;
  updatedAt: Date;
  categories: TaxonomyItem[];
  tags: TaxonomyItem[];
  relatedBrands: Array<{
    id: string;
    name: string;
    slug: string;
    region: string | null;
    city: string | null;
  }>;
  relatedContents: Array<{
    id: string;
    title: string;
    slug: string;
    summary: string | null;
  }>;
  seoTitle: string | null;
  seoDescription: string | null;
};

function getDatabaseUnavailableMessage() {
  if (!process.env.DATABASE_URL) {
    return "当前未配置 DATABASE_URL，前台详情页无法读取真实内容数据。";
  }

  return "数据库当前不可用，前台详情页暂时无法读取真实内容。";
}

async function safeDetailQuery<T>(
  query: () => Promise<T | null>,
): Promise<DetailResult<T>> {
  if (!process.env.DATABASE_URL) {
    return {
      data: null,
      error: getDatabaseUnavailableMessage(),
      databaseReady: false,
    };
  }

  try {
    return {
      data: await query(),
      databaseReady: true,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "读取详情数据时发生未知错误。",
      databaseReady: false,
    };
  }
}

function buildPublishedOrder() {
  return [{ publishedAt: "desc" as const }, { updatedAt: "desc" as const }];
}

function stripTaxonomyIds(items: TaxonomyWithId[]): TaxonomyItem[] {
  return items.map((item) => ({
    name: item.name,
    slug: item.slug,
  }));
}

function stripTagIds(items: TagWithId[]): TaxonomyItem[] {
  return items.map((item) => ({
    name: item.name,
    slug: item.slug,
  }));
}

export async function getPublishedContentDetail(slug: string) {
  return safeDetailQuery<ContentDetail>(async () => {
    const item = await prisma.content.findFirst({
      where: {
        slug,
        workflowStatus: WorkflowStatus.PUBLISHED,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        body: true,
        contentType: true,
        publishedAt: true,
        updatedAt: true,
        seoTitle: true,
        seoDescription: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        relatedTerms: {
          where: {
            workflowStatus: WorkflowStatus.PUBLISHED,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
          take: 6,
        },
        relatedBrands: {
          where: {
            workflowStatus: WorkflowStatus.PUBLISHED,
          },
          select: {
            id: true,
            name: true,
            slug: true,
          },
          take: 6,
        },
      },
    });

    if (!item) {
      return null;
    }

    const categoryIds = item.categories.map((category) => category.id);
    const tagIds = item.tags.map((tag) => tag.id);
    const termIds = item.relatedTerms.map((term) => term.id);
    const brandIds = item.relatedBrands.map((brand) => brand.id);
    const relatedClauses: Prisma.ContentWhereInput[] = [];

    if (categoryIds.length > 0) {
      relatedClauses.push({
        categories: {
          some: {
            id: { in: categoryIds },
          },
        },
      });
    }

    if (tagIds.length > 0) {
      relatedClauses.push({
        tags: {
          some: {
            id: { in: tagIds },
          },
        },
      });
    }

    if (termIds.length > 0) {
      relatedClauses.push({
        relatedTerms: {
          some: {
            id: { in: termIds },
          },
        },
      });
    }

    if (brandIds.length > 0) {
      relatedClauses.push({
        relatedBrands: {
          some: {
            id: { in: brandIds },
          },
        },
      });
    }

    const relatedContents =
      relatedClauses.length > 0
        ? await prisma.content.findMany({
            where: {
              id: { not: item.id },
              workflowStatus: WorkflowStatus.PUBLISHED,
              OR: relatedClauses,
            },
            orderBy: [{ isFeatured: "desc" }, ...buildPublishedOrder()],
            take: 3,
            select: {
              id: true,
              title: true,
              slug: true,
              summary: true,
              publishedAt: true,
            },
          })
        : [];

    return {
      ...item,
      categories: stripTaxonomyIds(item.categories),
      tags: stripTaxonomyIds(item.tags),
      relatedContents,
    };
  });
}

export async function getPublishedTermDetail(slug: string) {
  return safeDetailQuery<TermDetail>(async () => {
    const item = await prisma.term.findFirst({
      where: {
        slug,
        workflowStatus: WorkflowStatus.PUBLISHED,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDefinition: true,
        definition: true,
        body: true,
        updatedAt: true,
        seoTitle: true,
        seoDescription: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        contents: {
          where: {
            workflowStatus: WorkflowStatus.PUBLISHED,
          },
          orderBy: buildPublishedOrder(),
          take: 3,
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
          },
        },
        tags: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!item) {
      return null;
    }

    const categoryIds = item.categories.map((category) => category.id);
    const tagIds = item.tags.map((tag) => tag.id);
    const contentIds = item.contents.map((content) => content.id);
    const relatedClauses: Prisma.TermWhereInput[] = [];

    if (categoryIds.length > 0) {
      relatedClauses.push({
        categories: {
          some: {
            id: { in: categoryIds },
          },
        },
      });
    }

    if (tagIds.length > 0) {
      relatedClauses.push({
        tags: {
          some: {
            id: { in: tagIds },
          },
        },
      });
    }

    if (contentIds.length > 0) {
      relatedClauses.push({
        contents: {
          some: {
            id: { in: contentIds },
          },
        },
      });
    }

    const relatedTerms =
      relatedClauses.length > 0
        ? await prisma.term.findMany({
            where: {
              id: { not: item.id },
              workflowStatus: WorkflowStatus.PUBLISHED,
              OR: relatedClauses,
            },
            orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
            take: 6,
            select: {
              id: true,
              name: true,
              slug: true,
              shortDefinition: true,
            },
          })
        : [];

    return {
      id: item.id,
      name: item.name,
      slug: item.slug,
      shortDefinition: item.shortDefinition,
      definition: item.definition,
      body: item.body,
      updatedAt: item.updatedAt,
      seoTitle: item.seoTitle,
      seoDescription: item.seoDescription,
      categories: stripTaxonomyIds(item.categories),
      relatedTerms,
      relatedContents: item.contents,
    };
  });
}

export async function getPublishedBrandDetail(slug: string) {
  return safeDetailQuery<BrandDetail>(async () => {
    const item = await prisma.brand.findFirst({
      where: {
        slug,
        workflowStatus: WorkflowStatus.PUBLISHED,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        tagline: true,
        summary: true,
        description: true,
        website: true,
        region: true,
        city: true,
        updatedAt: true,
        seoTitle: true,
        seoDescription: true,
        categories: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!item) {
      return null;
    }

    const categoryIds = item.categories.map((category) => category.id);
    const tagIds = item.tags.map((tag) => tag.id);
    const relatedBrandClauses: Prisma.BrandWhereInput[] = [];

    if (item.region) {
      relatedBrandClauses.push({
        region: item.region,
      });
    }

    if (categoryIds.length > 0) {
      relatedBrandClauses.push({
        categories: {
          some: {
            id: { in: categoryIds },
          },
        },
      });
    }

    if (tagIds.length > 0) {
      relatedBrandClauses.push({
        tags: {
          some: {
            id: { in: tagIds },
          },
        },
      });
    }

    const relatedBrands =
      relatedBrandClauses.length > 0
        ? await prisma.brand.findMany({
            where: {
              id: { not: item.id },
              workflowStatus: WorkflowStatus.PUBLISHED,
              OR: relatedBrandClauses,
            },
            orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }],
            take: 3,
            select: {
              id: true,
              name: true,
              slug: true,
              region: true,
              city: true,
            },
          })
        : [];

    const relatedBrandIds = relatedBrands.map((brand) => brand.id);
    const relatedContentClauses: Prisma.ContentWhereInput[] = [
      {
        relatedBrands: {
          some: {
            id: item.id,
          },
        },
      },
    ];

    if (tagIds.length > 0) {
      relatedContentClauses.push({
        tags: {
          some: {
            id: { in: tagIds },
          },
        },
      });
    }

    if (relatedBrandIds.length > 0) {
      relatedContentClauses.push({
        relatedBrands: {
          some: {
            id: { in: relatedBrandIds },
          },
        },
      });
    }

    const relatedContents = await prisma.content.findMany({
      where: {
        workflowStatus: WorkflowStatus.PUBLISHED,
        OR: relatedContentClauses,
      },
      orderBy: [{ isFeatured: "desc" }, ...buildPublishedOrder()],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
      },
    });

    return {
      ...item,
      categories: stripTaxonomyIds(item.categories),
      tags: stripTagIds(item.tags),
      relatedBrands,
      relatedContents,
    };
  });
}
