/**
 * 文件说明：该文件实现后台资源管理所需的服务端数据读取能力。
 * 功能说明：统一封装 Content / Term / Brand 的列表与编辑查询，并对数据库不可用场景做最小兜底。
 *
 * 结构概览：
 *   第一部分：共享结果类型与数据库兜底
 *   第二部分：列表查询
 *   第三部分：编辑页查询
 */

import "server-only";

import type { Prisma, WorkflowStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  BrandEditorData,
  ContentEditorData,
  ResourceListQuery,
  TermEditorData,
} from "@/features/admin/resources/types";
import { getErrorMessage } from "@/features/admin/resources/utils";

export type DataResult<T> = {
  data: T;
  error?: string;
  databaseReady: boolean;
};

export type ContentListItem = {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  workflowStatus: WorkflowStatus;
  updatedAt: Date;
  publishedAt: Date | null;
};

export type TermListItem = {
  id: string;
  name: string;
  slug: string;
  shortDefinition: string | null;
  workflowStatus: WorkflowStatus;
  updatedAt: Date;
  publishedAt: Date | null;
};

export type BrandListItem = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  region: string | null;
  workflowStatus: WorkflowStatus;
  updatedAt: Date;
  publishedAt: Date | null;
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
    ],
  };
}

export async function getContentList(query: ResourceListQuery) {
  return safeQuery<ContentListItem[]>(
    () =>
      prisma.content.findMany({
        where: {
          ...buildStatusFilter(query.status),
          ...buildContentSearchFilter(query.q),
        },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          contentType: true,
          workflowStatus: true,
          updatedAt: true,
          publishedAt: true,
        },
      }),
    [],
  );
}

export async function getTermList(query: ResourceListQuery) {
  return safeQuery<TermListItem[]>(
    () =>
      prisma.term.findMany({
        where: {
          ...buildStatusFilter(query.status),
          ...buildTermSearchFilter(query.q),
        },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          shortDefinition: true,
          workflowStatus: true,
          updatedAt: true,
          publishedAt: true,
        },
      }),
    [],
  );
}

export async function getBrandList(query: ResourceListQuery) {
  return safeQuery<BrandListItem[]>(
    () =>
      prisma.brand.findMany({
        where: {
          ...buildStatusFilter(query.status),
          ...buildBrandSearchFilter(query.q),
        },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          name: true,
          slug: true,
          city: true,
          region: true,
          workflowStatus: true,
          updatedAt: true,
          publishedAt: true,
        },
      }),
    [],
  );
}

export async function getContentEditorData(id: string) {
  return safeQuery<ContentEditorData | null>(
    async () => {
      const item = await prisma.content.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          slug: true,
          contentType: true,
          summary: true,
          body: true,
          workflowStatus: true,
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
      });

      if (!item) {
        return null;
      }

      return {
        formValues: {
          id: item.id,
          title: item.title,
          slug: item.slug,
          contentType: item.contentType,
          summary: item.summary ?? "",
          body: item.body ?? "",
          workflowStatus: item.workflowStatus,
        },
        workflowHistory: item.workflows,
        versions: item.versions,
        aiTasks: item.aiTasks,
      };
    },
    null,
  );
}

export async function getTermEditorData(id: string) {
  return safeQuery<TermEditorData | null>(
    async () => {
      const item = await prisma.term.findUnique({
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
      });

      if (!item) {
        return null;
      }

      return {
        formValues: {
          id: item.id,
          name: item.name,
          slug: item.slug,
          aliases: item.aliases.join(", "),
          shortDefinition: item.shortDefinition ?? "",
          definition: item.definition,
          body: item.body ?? "",
          workflowStatus: item.workflowStatus,
        },
        workflowHistory: item.workflows,
      };
    },
    null,
  );
}

export async function getBrandEditorData(id: string) {
  return safeQuery<BrandEditorData | null>(
    async () => {
      const item = await prisma.brand.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          slug: true,
          summary: true,
          description: true,
          website: true,
          region: true,
          city: true,
          workflowStatus: true,
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
      });

      if (!item) {
        return null;
      }

      return {
        formValues: {
          id: item.id,
          name: item.name,
          slug: item.slug,
          summary: item.summary ?? "",
          description: item.description ?? "",
          website: item.website ?? "",
          region: item.region ?? "",
          city: item.city ?? "",
          workflowStatus: item.workflowStatus,
        },
        workflowHistory: item.workflows,
      };
    },
    null,
  );
}
