/**
 * 文件说明：该文件实现 AI 编辑部模块所需的服务端数据读取能力。
 * 功能说明：统一提供 AI 任务列表、编辑页数据、可关联内容候选项与模板候选项，并在数据库不可用时给出稳定兜底。
 *
 * 结构概览：
 *   第一部分：结果包装与查询兜底
 *   第二部分：AI 任务列表查询
 *   第三部分：AI 任务创建 / 编辑页查询
 */

import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getPromptTemplateOptions } from "@/features/admin/editorial/templates";
import type {
  AiTaskEditorData,
  AiTaskListItem,
  AiTaskListQuery,
  ContentOption,
  PromptTemplateOption,
} from "@/features/admin/editorial/types";
import {
  formatKeywordsInput,
  parseAiTaskPayload,
} from "@/features/admin/editorial/utils";
import { getErrorMessage } from "@/features/admin/resources/utils";

type DataResult<T> = {
  data: T;
  error?: string;
  databaseReady: boolean;
};

type AiTaskCreationOptions = {
  contentOptions: ContentOption[];
  templateOptions: PromptTemplateOption[];
};

function getDatabaseUnavailableMessage() {
  if (!process.env.DATABASE_URL) {
    return "未检测到 DATABASE_URL，当前 AI 编辑部页面会以只读骨架方式显示。";
  }

  return "数据库暂时不可用，当前 AI 编辑部页面仅展示结构与兜底提示。";
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
      {
        modelName: {
          contains: query,
          mode: "insensitive",
        },
      },
    ],
  };
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

async function getSharedCreationOptions(): Promise<AiTaskCreationOptions> {
  const [contentOptions, templateOptions] = await Promise.all([
    getContentOptions(),
    getPromptTemplateOptions(),
  ]);

  return {
    contentOptions,
    templateOptions,
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
          modelName: true,
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
          title: payload.input.title || "未命名任务",
          templateId: payload.templateId,
          templateName: payload.templateName,
          targetKind: payload.targetKind,
          providerId: item.modelName,
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

export async function getAiTaskEditorData(id: string) {
  return safeQuery<AiTaskEditorData | null>(
    async () => {
      const [task, sharedOptions] = await Promise.all([
        prisma.aiTask.findUnique({
          where: { id },
          select: {
            id: true,
            taskType: true,
            status: true,
            modelName: true,
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
        getSharedCreationOptions(),
      ]);

      if (!task) {
        return null;
      }

      const payload = parseAiTaskPayload(task.inputPayload);
      const templateOptions = sharedOptions.templateOptions.some(
        (item) => item.id === payload.templateId,
      )
        ? sharedOptions.templateOptions
        : [
            {
              id: payload.templateId,
              name: payload.templateName,
              description: "历史任务输入结构，保存后会升级为当前模板层格式。",
              targetKind: payload.targetKind,
              defaultTaskType: task.taskType,
              supportedTaskTypes: [task.taskType],
              supportedContentTypes: [payload.input.contentType],
              generationGoals: [payload.input.generationGoal],
            },
            ...sharedOptions.templateOptions,
          ];

      return {
        formValues: {
          id: task.id,
          title: payload.input.title,
          templateId: payload.templateId,
          taskType: task.taskType,
          topic: payload.input.topic,
          keywords: formatKeywordsInput(payload.input.keywords),
          contentType: payload.input.contentType,
          generationGoal: payload.input.generationGoal,
          notes: payload.input.notes,
          shouldCreateDraft: payload.input.shouldCreateDraft,
          contentId: task.content?.id ?? "",
          targetKind: payload.targetKind,
          status: task.status,
          outputText: task.outputText ?? "",
        },
        contentOptions: sharedOptions.contentOptions,
        templateOptions,
        providerId: task.modelName,
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
  const templateOptions = await getPromptTemplateOptions();

  if (!process.env.DATABASE_URL) {
    return {
      data: {
        contentOptions: [],
        templateOptions,
      },
      error: getDatabaseUnavailableMessage(),
      databaseReady: false,
    };
  }

  try {
    return {
      data: {
        contentOptions: await getContentOptions(),
        templateOptions,
      },
      databaseReady: true,
    };
  } catch (error) {
    return {
      data: {
        contentOptions: [],
        templateOptions,
      },
      error: getErrorMessage(error),
      databaseReady: false,
    };
  }
}
