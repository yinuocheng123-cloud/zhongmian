/**
 * 文件说明：该文件实现 AI 编辑部模块所需的服务端数据读取能力。
 * 功能说明：统一提供 AI 任务列表、编辑页数据、内容候选项和数据库不可用兜底。
 *
 * 结构概览：
 *   第一部分：结果类型与兜底工具
 *   第二部分：列表查询
 *   第三部分：编辑页查询
 */

import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AiTaskEditorData,
  AiTaskListItem,
  AiTaskListQuery,
  ContentOption,
} from "@/features/admin/editorial/types";
import { parseAiTaskPayload } from "@/features/admin/editorial/utils";
import { getErrorMessage } from "@/features/admin/resources/utils";

type DataResult<T> = {
  data: T;
  error?: string;
  databaseReady: boolean;
};

function getDatabaseUnavailableMessage() {
  if (!process.env.DATABASE_URL) {
    return "未检测到 DATABASE_URL，当前 AI 编辑部页面会以只读骨架方式显示。";
  }

  return "数据库暂时不可用，当前 AI 编辑部页面仅展示结构和兜底提示。";
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

function buildAiTaskSearchFilter(q?: string): Prisma.AiTaskWhereInput {
  if (!q?.trim()) {
    return {};
  }

  const query = q.trim();

  return {
    OR: [
      {
        prompt: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        outputText: {
          contains: query,
          mode: "insensitive",
        },
      },
      {
        content: {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },
      },
    ],
  };
}

export async function getAiTaskList(query: AiTaskListQuery) {
  return safeQuery<AiTaskListItem[]>(
    async () => {
      const items = await prisma.aiTask.findMany({
        where: {
          ...(query.status ? { status: query.status } : {}),
          ...buildAiTaskSearchFilter(query.q),
        },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          taskType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          finishedAt: true,
          inputPayload: true,
          content: {
            select: {
              id: true,
              title: true,
              workflowStatus: true,
            },
          },
        },
      });

      return items.map((item) => {
        const payload = parseAiTaskPayload(item.inputPayload);

        return {
          id: item.id,
          title: payload.title || "未命名任务",
          taskType: item.taskType,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          finishedAt: item.finishedAt,
          content: item.content,
        };
      });
    },
    [],
  );
}

async function getContentOptions(): Promise<ContentOption[]> {
  const items = await prisma.content.findMany({
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: {
      id: true,
      title: true,
      slug: true,
      workflowStatus: true,
    },
  });

  return items;
}

export async function getAiTaskEditorData(id: string) {
  return safeQuery<AiTaskEditorData | null>(
    async () => {
      const [task, contentOptions] = await Promise.all([
        prisma.aiTask.findUnique({
          where: { id },
          select: {
            id: true,
            taskType: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            finishedAt: true,
            inputPayload: true,
            outputText: true,
            content: {
              select: {
                id: true,
                title: true,
                slug: true,
                workflowStatus: true,
              },
            },
          },
        }),
        getContentOptions(),
      ]);

      if (!task) {
        return null;
      }

      const payload = parseAiTaskPayload(task.inputPayload);

      return {
        formValues: {
          id: task.id,
          title: payload.title,
          taskType: task.taskType,
          direction: payload.direction,
          notes: payload.notes,
          shouldCreateDraft: payload.shouldCreateDraft,
          desiredContentType: payload.desiredContentType,
          contentId: task.content?.id ?? "",
          status: task.status,
          outputText: task.outputText ?? "",
        },
        contentOptions,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        finishedAt: task.finishedAt,
        content: task.content,
      };
    },
    null,
  );
}

export async function getAiTaskCreationOptions() {
  return safeQuery<ContentOption[]>(() => getContentOptions(), []);
}
