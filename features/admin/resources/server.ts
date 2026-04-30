/**
 * 文件说明：该文件实现后台资源管理所需的服务端数据读取能力。
 * 功能说明：统一封装 Content / Term / Brand 的列表、编辑页、分类标签选项与后台运营概览查询。
 *
 * 结构概览：
 *   第一部分：结果封装与数据库兜底
 *   第二部分：分类标签与列表查询
 *   第三部分：编辑页与后台仪表盘查询
 */

import "server-only";

import type {
  CategoryScope,
  Prisma,
  WorkflowStatus,
} from "@prisma/client";
import { requireAdminSession } from "@/features/admin/auth/session";
import { prisma } from "@/lib/prisma";
import type {
  AdminDashboardData,
  BrandEditorData,
  BrandListItem,
  ContentEditorData,
  ContentListItem,
  DashboardStatusCount,
  ResourceListQuery,
  ResourceTaxonomyOptions,
  TaxonomyOption,
  TermEditorData,
  TermListItem,
} from "@/features/admin/resources/types";
import {
  buildPublicPath,
  formatDateTimeLocalInput,
  getErrorMessage,
  getSuspiciousPublishReason,
} from "@/features/admin/resources/utils";
import { workflowStatusLabels } from "@/features/admin/resources/constants";

export type DataResult<T> = {
  data: T;
  error?: string;
  databaseReady: boolean;
};

function getDatabaseUnavailableMessage() {
  if (!process.env.DATABASE_URL) {
    return "未检测到 DATABASE_URL，当前页面会以只读骨架方式显示。";
  }

  return "数据库暂时不可用，当前页面仅展示结构与兜底提示。";
}

async function safeQuery<T>(
  query: () => Promise<T>,
  fallback: T,
): Promise<DataResult<T>> {
  if (!process.env.DATABASE_URL) {
    return {
      data: fallback,
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
      data: fallback,
      error: getErrorMessage(error),
      databaseReady: false,
    };
  }
}

function buildStatusFilter(status?: WorkflowStatus | "") {
  return status ? { workflowStatus: status } : {};
}

function buildContentSearchFilter(q?: string): Prisma.ContentWhereInput {
  if (!q?.trim()) {
    return {};
  }

  const query = q.trim();

  return {
    OR: [
      { title: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { summary: { contains: query, mode: "insensitive" } },
      { tags: { some: { name: { contains: query, mode: "insensitive" } } } },
    ],
  };
}

function buildTermSearchFilter(q?: string): Prisma.TermWhereInput {
  if (!q?.trim()) {
    return {};
  }

  const query = q.trim();

  return {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { shortDefinition: { contains: query, mode: "insensitive" } },
      { tags: { some: { name: { contains: query, mode: "insensitive" } } } },
    ],
  };
}

function buildBrandSearchFilter(q?: string): Prisma.BrandWhereInput {
  if (!q?.trim()) {
    return {};
  }

  const query = q.trim();

  return {
    OR: [
      { name: { contains: query, mode: "insensitive" } },
      { slug: { contains: query, mode: "insensitive" } },
      { tagline: { contains: query, mode: "insensitive" } },
      { region: { contains: query, mode: "insensitive" } },
      { city: { contains: query, mode: "insensitive" } },
      { tags: { some: { name: { contains: query, mode: "insensitive" } } } },
    ],
  };
}

function mapCategoryOptions(
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
    scope: CategoryScope;
  }>,
): TaxonomyOption[] {
  return categories.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
    scope: item.scope,
  }));
}

function mapTagOptions(
  tags: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }>,
): TaxonomyOption[] {
  return tags.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.description,
  }));
}

async function getTaxonomyOptions(
  scopes: CategoryScope[],
): Promise<ResourceTaxonomyOptions> {
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      where: {
        isActive: true,
        scope: { in: scopes },
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        scope: true,
      },
    }),
    prisma.tag.findMany({
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
    }),
  ]);

  return {
    categoryOptions: mapCategoryOptions(categories),
    tagOptions: mapTagOptions(tags),
  };
}

export async function getContentTaxonomyOptions(
  nextPath = "/admin/content",
) {
  await requireAdminSession(nextPath);

  return safeQuery<ResourceTaxonomyOptions>(
    () => getTaxonomyOptions(["GENERAL", "CONTENT", "INDUSTRY"]),
    {
      categoryOptions: [],
      tagOptions: [],
    },
  );
}

async function getContentBrandOptions() {
  const brands = await prisma.brand.findMany({
    orderBy: [{ isFeatured: "desc" }, { updatedAt: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      summary: true,
    },
    take: 60,
  });

  return brands.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    description: item.summary,
  }));
}

export async function getContentCreationOptions(nextPath = "/admin/content/new") {
  await requireAdminSession(nextPath);

  return safeQuery<
    ResourceTaxonomyOptions & {
      brandOptions: TaxonomyOption[];
    }
  >(
    async () => {
      const [taxonomy, brandOptions] = await Promise.all([
        getTaxonomyOptions(["GENERAL", "CONTENT", "INDUSTRY"]),
        getContentBrandOptions(),
      ]);

      return {
        ...taxonomy,
        brandOptions,
      };
    },
    {
      categoryOptions: [],
      tagOptions: [],
      brandOptions: [],
    },
  );
}

export async function getTermTaxonomyOptions() {
  await requireAdminSession("/admin/terms");

  return safeQuery<ResourceTaxonomyOptions>(
    () => getTaxonomyOptions(["GENERAL", "TERM", "INDUSTRY"]),
    {
      categoryOptions: [],
      tagOptions: [],
    },
  );
}

export async function getBrandTaxonomyOptions() {
  await requireAdminSession("/admin/brands");

  return safeQuery<ResourceTaxonomyOptions>(
    () => getTaxonomyOptions(["GENERAL", "BRAND", "INDUSTRY"]),
    {
      categoryOptions: [],
      tagOptions: [],
    },
  );
}

export async function getContentList(
  query: ResourceListQuery,
  nextPath = "/admin/content",
) {
  await requireAdminSession(nextPath);

  return safeQuery<ContentListItem[]>(
    async () => {
      const items = await prisma.content.findMany({
        where: {
          ...buildStatusFilter(query.status),
          ...(query.contentType ? { contentType: query.contentType } : {}),
          ...(query.channelKey ? { channelKey: query.channelKey } : {}),
          ...buildContentSearchFilter(query.q),
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          title: true,
          slug: true,
          contentType: true,
          channelKey: true,
          workflowStatus: true,
          updatedAt: true,
          publishedAt: true,
          categories: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
            take: 4,
          },
        },
      });

      return items.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug,
        contentType: item.contentType,
        channelKey: item.channelKey,
        workflowStatus: item.workflowStatus,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt,
        categoryNames: item.categories.map((category) => category.name),
        tagNames: item.tags.map((tag) => tag.name),
        publicPath:
          item.workflowStatus === "PUBLISHED"
            ? buildPublicPath("content", item.slug, {
                channelKey: item.channelKey,
              })
            : null,
        isSuspicious: Boolean(getSuspiciousPublishReason(item.title)),
      }));
    },
    [],
  );
}

export async function getTermList(query: ResourceListQuery) {
  await requireAdminSession("/admin/terms");

  return safeQuery<TermListItem[]>(
    async () => {
      const items = await prisma.term.findMany({
        where: {
          ...buildStatusFilter(query.status),
          ...buildTermSearchFilter(query.q),
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          shortDefinition: true,
          workflowStatus: true,
          updatedAt: true,
          publishedAt: true,
          categories: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
            take: 4,
          },
        },
      });

      return items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        shortDefinition: item.shortDefinition,
        workflowStatus: item.workflowStatus,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt,
        categoryNames: item.categories.map((category) => category.name),
        tagNames: item.tags.map((tag) => tag.name),
        publicPath:
          item.workflowStatus === "PUBLISHED"
            ? buildPublicPath("term", item.slug)
            : null,
        isSuspicious: Boolean(getSuspiciousPublishReason(item.name)),
      }));
    },
    [],
  );
}

export async function getBrandList(query: ResourceListQuery) {
  await requireAdminSession("/admin/brands");

  return safeQuery<BrandListItem[]>(
    async () => {
      const items = await prisma.brand.findMany({
        where: {
          ...buildStatusFilter(query.status),
          ...buildBrandSearchFilter(query.q),
        },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          tagline: true,
          city: true,
          region: true,
          workflowStatus: true,
          updatedAt: true,
          publishedAt: true,
          categories: {
            select: {
              name: true,
            },
          },
          tags: {
            select: {
              name: true,
            },
            take: 4,
          },
        },
      });

      return items.map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        tagline: item.tagline,
        city: item.city,
        region: item.region,
        workflowStatus: item.workflowStatus,
        updatedAt: item.updatedAt,
        publishedAt: item.publishedAt,
        categoryNames: item.categories.map((category) => category.name),
        tagNames: item.tags.map((tag) => tag.name),
        publicPath:
          item.workflowStatus === "PUBLISHED"
            ? buildPublicPath("brand", item.slug)
            : null,
        isSuspicious: Boolean(getSuspiciousPublishReason(item.name)),
      }));
    },
    [],
  );
}

export async function getContentEditorData(
  id: string,
  nextPath = `/admin/content/${id}`,
) {
  await requireAdminSession(nextPath);

  return safeQuery<ContentEditorData | null>(
    async () => {
      const [item, taxonomy, brandOptions] = await Promise.all([
        prisma.content.findUnique({
          where: { id },
          select: {
            id: true,
            title: true,
            slug: true,
            contentType: true,
            channelKey: true,
            summary: true,
            body: true,
            eventStartAt: true,
            eventLocation: true,
            eventKind: true,
            referenceVersion: true,
            workflowStatus: true,
            publishedAt: true,
            categories: {
              select: {
                id: true,
              },
            },
            tags: {
              select: {
                id: true,
              },
            },
            relatedBrands: {
              select: {
                id: true,
              },
            },
            workflows: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                fromStatus: true,
                toStatus: true,
                note: true,
                actorName: true,
                createdAt: true,
              },
            },
            versions: {
              orderBy: { versionNumber: "desc" },
              select: {
                id: true,
                versionNumber: true,
                titleSnapshot: true,
                changeNote: true,
                createdBy: true,
                createdAt: true,
              },
            },
            aiTasks: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                taskType: true,
                status: true,
                modelName: true,
                createdAt: true,
                finishedAt: true,
              },
            },
          },
        }),
        getTaxonomyOptions(["GENERAL", "CONTENT", "INDUSTRY"]),
        getContentBrandOptions(),
      ]);

      if (!item) {
        return null;
      }

      return {
        formValues: {
          id: item.id,
          title: item.title,
          slug: item.slug,
          contentType: item.contentType,
          channelKey: item.channelKey,
          summary: item.summary ?? "",
          body: item.body ?? "",
          publishedAt: formatDateTimeLocalInput(item.publishedAt),
          eventStartAt: formatDateTimeLocalInput(item.eventStartAt),
          eventLocation: item.eventLocation ?? "",
          eventKind: item.eventKind ?? "",
          referenceVersion: item.referenceVersion ?? "",
          categoryIds: item.categories.map((category) => category.id),
          tagIds: item.tags.map((tag) => tag.id),
          relatedBrandIds: item.relatedBrands.map((brand) => brand.id),
          workflowStatus: item.workflowStatus,
        },
        workflowHistory: item.workflows,
        versions: item.versions,
        aiTasks: item.aiTasks,
        categoryOptions: taxonomy.categoryOptions,
        tagOptions: taxonomy.tagOptions,
        brandOptions,
        publicPath:
          item.workflowStatus === "PUBLISHED"
            ? buildPublicPath("content", item.slug, {
                channelKey: item.channelKey,
              })
            : null,
      };
    },
    null,
  );
}

export async function getTermEditorData(id: string) {
  await requireAdminSession(`/admin/terms/${id}`);

  return safeQuery<TermEditorData | null>(
    async () => {
      const [item, taxonomy] = await Promise.all([
        prisma.term.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            slug: true,
            aliases: true,
            shortDefinition: true,
            definition: true,
            body: true,
            workflowStatus: true,
            publishedAt: true,
            categories: {
              select: {
                id: true,
              },
            },
            tags: {
              select: {
                id: true,
              },
            },
            workflows: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                fromStatus: true,
                toStatus: true,
                note: true,
                actorName: true,
                createdAt: true,
              },
            },
          },
        }),
        getTaxonomyOptions(["GENERAL", "TERM", "INDUSTRY"]),
      ]);

      if (!item) {
        return null;
      }

      return {
        formValues: {
          id: item.id,
          name: item.name,
          slug: item.slug,
          aliases: item.aliases.join("，"),
          shortDefinition: item.shortDefinition ?? "",
          definition: item.definition,
          body: item.body ?? "",
          publishedAt: formatDateTimeLocalInput(item.publishedAt),
          categoryIds: item.categories.map((category) => category.id),
          tagIds: item.tags.map((tag) => tag.id),
          workflowStatus: item.workflowStatus,
        },
        workflowHistory: item.workflows,
        categoryOptions: taxonomy.categoryOptions,
        tagOptions: taxonomy.tagOptions,
        publicPath:
          item.workflowStatus === "PUBLISHED"
            ? buildPublicPath("term", item.slug)
            : null,
      };
    },
    null,
  );
}

export async function getBrandEditorData(id: string) {
  await requireAdminSession(`/admin/brands/${id}`);

  return safeQuery<BrandEditorData | null>(
    async () => {
      const [item, taxonomy] = await Promise.all([
        prisma.brand.findUnique({
          where: { id },
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
            workflowStatus: true,
            publishedAt: true,
            categories: {
              select: {
                id: true,
              },
            },
            tags: {
              select: {
                id: true,
              },
            },
            workflows: {
              orderBy: { createdAt: "desc" },
              select: {
                id: true,
                fromStatus: true,
                toStatus: true,
                note: true,
                actorName: true,
                createdAt: true,
              },
            },
          },
        }),
        getTaxonomyOptions(["GENERAL", "BRAND", "INDUSTRY"]),
      ]);

      if (!item) {
        return null;
      }

      return {
        formValues: {
          id: item.id,
          name: item.name,
          slug: item.slug,
          tagline: item.tagline ?? "",
          summary: item.summary ?? "",
          description: item.description ?? "",
          website: item.website ?? "",
          region: item.region ?? "",
          city: item.city ?? "",
          publishedAt: formatDateTimeLocalInput(item.publishedAt),
          categoryIds: item.categories.map((category) => category.id),
          tagIds: item.tags.map((tag) => tag.id),
          workflowStatus: item.workflowStatus,
        },
        workflowHistory: item.workflows,
        categoryOptions: taxonomy.categoryOptions,
        tagOptions: taxonomy.tagOptions,
        publicPath:
          item.workflowStatus === "PUBLISHED"
            ? buildPublicPath("brand", item.slug)
            : null,
      };
    },
    null,
  );
}

function mapStatusCounts(counts: Record<WorkflowStatus, number>): DashboardStatusCount[] {
  return (Object.keys(workflowStatusLabels) as WorkflowStatus[]).map((status) => ({
    status,
    label: workflowStatusLabels[status],
    count: counts[status] ?? 0,
  }));
}

async function countByStatus<T extends { workflowStatus: WorkflowStatus }>(
  items: T[],
) {
  return items.reduce<Record<WorkflowStatus, number>>(
    (accumulator, item) => {
      accumulator[item.workflowStatus] = (accumulator[item.workflowStatus] ?? 0) + 1;
      return accumulator;
    },
    {
      DRAFT: 0,
      PENDING_EDIT: 0,
      PENDING_REVIEW: 0,
      PUBLISHED: 0,
      OFFLINE: 0,
    },
  );
}

export async function getAdminDashboardData() {
  await requireAdminSession("/admin");

  return safeQuery<AdminDashboardData>(
    async () => {
      const [
        contents,
        terms,
        brands,
        recentContents,
        recentAiTasks,
      ] = await Promise.all([
        prisma.content.findMany({
          select: {
            workflowStatus: true,
            title: true,
          },
        }),
        prisma.term.findMany({
          select: {
            workflowStatus: true,
            name: true,
          },
        }),
        prisma.brand.findMany({
          select: {
            workflowStatus: true,
            name: true,
          },
        }),
        prisma.content.findMany({
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
          take: 6,
          select: {
            id: true,
            title: true,
            contentType: true,
            workflowStatus: true,
            updatedAt: true,
          },
        }),
        prisma.aiTask.findMany({
          orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
          take: 6,
          select: {
            id: true,
            taskType: true,
            status: true,
            modelName: true,
            updatedAt: true,
            inputPayload: true,
            contentId: true,
          },
        }),
      ]);

      const contentStatusCounts = await countByStatus(contents);
      const termStatusCounts = await countByStatus(terms);
      const brandStatusCounts = await countByStatus(brands);

      const suspiciousPublishedCount =
        contents.filter(
          (item) =>
            item.workflowStatus === "PUBLISHED" &&
            getSuspiciousPublishReason(item.title),
        ).length +
        terms.filter(
          (item) =>
            item.workflowStatus === "PUBLISHED" &&
            getSuspiciousPublishReason(item.name),
        ).length +
        brands.filter(
          (item) =>
            item.workflowStatus === "PUBLISHED" &&
            getSuspiciousPublishReason(item.name),
        ).length;

      return {
        overviewCards: [
          {
            label: "内容总量",
            value: contents.length,
            detail: `已发布 ${contentStatusCounts.PUBLISHED}，待审核 ${contentStatusCounts.PENDING_REVIEW}`,
          },
          {
            label: "词条总量",
            value: terms.length,
            detail: `已发布 ${termStatusCounts.PUBLISHED}，草稿 ${termStatusCounts.DRAFT}`,
          },
          {
            label: "品牌总量",
            value: brands.length,
            detail: `已发布 ${brandStatusCounts.PUBLISHED}，待补充 ${brandStatusCounts.DRAFT}`,
          },
          {
            label: "待审核总量",
            value:
              contentStatusCounts.PENDING_REVIEW +
              termStatusCounts.PENDING_REVIEW +
              brandStatusCounts.PENDING_REVIEW,
            detail: "用于运营进入后台后的第一优先级处理",
          },
        ],
        contentStatusCounts: mapStatusCounts(contentStatusCounts),
        termStatusCounts: mapStatusCounts(termStatusCounts),
        brandStatusCounts: mapStatusCounts(brandStatusCounts),
        recentContents,
        recentAiTasks: recentAiTasks.map((task) => {
          const payload =
            typeof task.inputPayload === "object" &&
            task.inputPayload &&
            !Array.isArray(task.inputPayload)
              ? (task.inputPayload as Record<string, unknown>)
              : null;
          const input =
            payload &&
            typeof payload.input === "object" &&
            payload.input &&
            !Array.isArray(payload.input)
              ? (payload.input as Record<string, unknown>)
              : null;

          return {
            id: task.id,
            title:
              typeof input?.title === "string" && input.title
                ? input.title
                : "未命名 AI 任务",
            status: task.status,
            taskType: task.taskType,
            providerId: task.modelName,
            updatedAt: task.updatedAt,
            contentId: task.contentId,
          };
        }),
        launchOverview: {
          publishedContentCount: contentStatusCounts.PUBLISHED,
          publishedTermCount: termStatusCounts.PUBLISHED,
          publishedBrandCount: brandStatusCounts.PUBLISHED,
          pendingReviewCount:
            contentStatusCounts.PENDING_REVIEW +
            termStatusCounts.PENDING_REVIEW +
            brandStatusCounts.PENDING_REVIEW,
          suspiciousPublishedCount,
        },
      };
    },
    {
      overviewCards: [],
      contentStatusCounts: [],
      termStatusCounts: [],
      brandStatusCounts: [],
      recentContents: [],
      recentAiTasks: [],
      launchOverview: {
        publishedContentCount: 0,
        publishedTermCount: 0,
        publishedBrandCount: 0,
        pendingReviewCount: 0,
        suspiciousPublishedCount: 0,
      },
    },
  );
}
