/**
 * 文件说明：该文件实现 AI 编辑部模块的服务端提交动作。
 * 功能说明：统一处理 AI 任务的新建、编辑、状态切换、占位稿生成和与 Content 草稿的挂接。
 *
 * 结构概览：
 *   第一部分：基础工具与校验
 *   第二部分：内容草稿挂接工具
 *   第三部分：AI 任务保存与占位生成动作
 */

"use server";

import {
  AiTaskType,
  ContentType,
  WorkflowStatus,
  type AiTaskStatus,
  type Prisma,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  aiEditorialIntentLabels,
  type AiEditorialIntent,
} from "@/features/admin/editorial/constants";
import type { AiTaskFormState } from "@/features/admin/editorial/types";
import { buildPlaceholderOutput } from "@/features/admin/editorial/utils";
import { slugify, getErrorMessage } from "@/features/admin/resources/utils";
import { prisma } from "@/lib/prisma";

function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function buildFieldErrorState(
  message: string,
  fieldErrors: Record<string, string>,
): AiTaskFormState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function ensureIntent(formData: FormData): AiEditorialIntent {
  const intent = formData.get("intent");

  if (
    intent === "SAVE" ||
    intent === "MARK_PENDING" ||
    intent === "MARK_RUNNING" ||
    intent === "GENERATE_PLACEHOLDER"
  ) {
    return intent;
  }

  return "SAVE";
}

function ensureDatabaseReady() {
  if (!process.env.DATABASE_URL) {
    throw new Error("未配置 DATABASE_URL，当前无法执行真实 AI 编辑部保存流程。");
  }
}

function getActorName() {
  // 当前阶段尚未接入真实权限系统，先统一使用稳定占位身份。
  return "admin-demo-user";
}

function resolveNextAiTaskStatus(
  intent: AiEditorialIntent,
  currentStatus?: AiTaskStatus | null,
) {
  if (intent === "SAVE") {
    return currentStatus ?? "PENDING";
  }

  if (intent === "MARK_PENDING") {
    return "PENDING";
  }

  if (intent === "MARK_RUNNING") {
    return "RUNNING";
  }

  return "SUCCEEDED";
}

async function ensureUniqueContentSlug(
  tx: Prisma.TransactionClient,
  baseTitle: string,
) {
  const baseSlug = slugify(baseTitle) || "ai-editorial-draft";

  for (let index = 0; index < 10; index += 1) {
    const slug = index === 0 ? baseSlug : `${baseSlug}-${index + 1}`;
    const existing = await tx.content.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (!existing) {
      return slug;
    }
  }

  return `${baseSlug}-${Date.now()}`;
}

async function createWorkflowLog(
  tx: Prisma.TransactionClient,
  params: {
    contentId: string;
    fromStatus?: WorkflowStatus | null;
    toStatus: WorkflowStatus;
    note: string;
    actorName: string;
  },
) {
  const hasStatusChanged = params.fromStatus !== params.toStatus;
  const isInitialLog = params.fromStatus == null;

  if (!hasStatusChanged && !isInitialLog) {
    return;
  }

  await tx.workflow.create({
    data: {
      targetType: "CONTENT",
      contentId: params.contentId,
      fromStatus: params.fromStatus ?? null,
      toStatus: params.toStatus,
      note: params.note,
      actorName: params.actorName,
    },
  });
}

async function createContentVersion(
  tx: Prisma.TransactionClient,
  params: {
    contentId: string;
    title: string;
    summary: string;
    body: string;
    createdBy: string;
    changeNote: string;
  },
) {
  const latestVersion = await tx.contentVersion.findFirst({
    where: { contentId: params.contentId },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });

  await tx.contentVersion.create({
    data: {
      contentId: params.contentId,
      versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
      titleSnapshot: params.title,
      summarySnapshot: params.summary,
      bodySnapshot: params.body,
      changeNote: params.changeNote,
      createdBy: params.createdBy,
    },
  });
}

async function resolveLinkedContent(
  tx: Prisma.TransactionClient,
  params: {
    existingContentId?: string;
    title: string;
    direction: string;
    desiredContentType: ContentType;
    shouldCreateDraft: boolean;
    placeholderOutput: string;
    actorName: string;
  },
) {
  if (params.existingContentId) {
    const existing = await tx.content.findUnique({
      where: { id: params.existingContentId },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        body: true,
        workflowStatus: true,
      },
    });

    if (!existing) {
      throw new Error("选择的关联内容不存在。");
    }

    const summary = existing.summary?.trim() || params.direction;
    const body = existing.body?.trim() || params.placeholderOutput;

    const updated = await tx.content.update({
      where: { id: existing.id },
      data: {
        summary,
        body,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        body: true,
        workflowStatus: true,
      },
    });

    await createContentVersion(tx, {
      contentId: updated.id,
      title: updated.title,
      summary: updated.summary ?? "",
      body: updated.body ?? "",
      createdBy: params.actorName,
      changeNote: "AI 编辑部挂接占位稿",
    });

    return updated;
  }

  if (!params.shouldCreateDraft) {
    return null;
  }

  const slug = await ensureUniqueContentSlug(tx, params.title);

  const created = await tx.content.create({
    data: {
      title: params.title,
      slug,
      contentType: params.desiredContentType,
      summary: params.direction,
      body: params.placeholderOutput,
      workflowStatus: "DRAFT",
      seoKeywords: [],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      body: true,
      workflowStatus: true,
    },
  });

  await createWorkflowLog(tx, {
    contentId: created.id,
    fromStatus: null,
    toStatus: "DRAFT",
    note: "由 AI 编辑部任务生成内容草稿。",
    actorName: params.actorName,
  });

  await createContentVersion(tx, {
    contentId: created.id,
    title: created.title,
    summary: created.summary ?? "",
    body: created.body ?? "",
    createdBy: params.actorName,
    changeNote: "AI 编辑部生成占位稿并创建草稿",
  });

  return created;
}

export async function saveAiTaskAction(
  taskId: string | null,
  _prevState: AiTaskFormState,
  formData: FormData,
): Promise<AiTaskFormState> {
  try {
    ensureDatabaseReady();

    const title = getTrimmedValue(formData, "title");
    const direction = getTrimmedValue(formData, "direction");
    const notes = getTrimmedValue(formData, "notes");
    const taskType = getTrimmedValue(formData, "taskType") as AiTaskType;
    const desiredContentType = getTrimmedValue(formData, "desiredContentType") as ContentType;
    const contentId = getTrimmedValue(formData, "contentId");
    const outputText = getTrimmedValue(formData, "outputText");
    const shouldCreateDraft = formData.get("shouldCreateDraft") === "on";
    const intent = ensureIntent(formData);

    const fieldErrors: Record<string, string> = {};

    if (!title) fieldErrors.title = "任务标题不能为空。";
    if (!direction) fieldErrors.direction = "请填写目标内容方向。";
    if (!Object.values(ContentType).includes(desiredContentType)) {
      fieldErrors.desiredContentType = "请选择合法的内容类型。";
    }
    if (!Object.values(AiTaskType).includes(taskType)) {
      fieldErrors.taskType = "请选择合法的任务类型。";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return buildFieldErrorState("请先修正 AI 任务表单中的必填项。", fieldErrors);
    }

    const actorName = getActorName();

    const savedTask = await prisma.$transaction(async (tx) => {
      const existing = taskId
        ? await tx.aiTask.findUnique({
            where: { id: taskId },
            select: {
              id: true,
              status: true,
              contentId: true,
              modelName: true,
              finishedAt: true,
            },
          })
        : null;

      const nextStatus = resolveNextAiTaskStatus(intent, existing?.status);
      const generatedOutput =
        intent === "GENERATE_PLACEHOLDER"
          ? buildPlaceholderOutput({ title, direction, notes })
          : outputText;
      const taskPrompt = `任务标题：${title}\n内容方向：${direction}\n资料备注：${notes || "暂无补充备注"}`;

      const linkedContent =
        intent === "GENERATE_PLACEHOLDER"
          ? await resolveLinkedContent(tx, {
              existingContentId: contentId || existing?.contentId || undefined,
              title,
              direction,
              desiredContentType,
              shouldCreateDraft,
              placeholderOutput: generatedOutput,
              actorName,
            })
          : null;
      const nextContentId =
        linkedContent?.id ?? (contentId || existing?.contentId || null);

      const task = existing
        ? await tx.aiTask.update({
            where: { id: existing.id },
            data: {
              taskType,
              status: nextStatus,
              prompt: taskPrompt,
              inputPayload: {
                title,
                direction,
                notes,
                shouldCreateDraft,
                desiredContentType,
              },
              outputText: generatedOutput || null,
              finishedAt:
                nextStatus === "SUCCEEDED"
                  ? new Date()
                  : nextStatus === "RUNNING"
                    ? null
                    : existing.finishedAt,
              modelName:
                intent === "GENERATE_PLACEHOLDER"
                  ? "placeholder-generator"
                  : existing.modelName,
              contentId: nextContentId,
            },
            select: { id: true, contentId: true },
          })
        : await tx.aiTask.create({
            data: {
              taskType,
              status: nextStatus,
              prompt: taskPrompt,
              inputPayload: {
                title,
                direction,
                notes,
                shouldCreateDraft,
                desiredContentType,
              },
              outputText: generatedOutput || null,
              finishedAt: nextStatus === "SUCCEEDED" ? new Date() : null,
              modelName:
                intent === "GENERATE_PLACEHOLDER" ? "placeholder-generator" : null,
              contentId: nextContentId,
            },
            select: { id: true, contentId: true },
          });

      return task;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/content");
    revalidatePath("/admin/ai-editorial");
    revalidatePath(`/admin/ai-editorial/${savedTask.id}`);
    if (savedTask.contentId) {
      revalidatePath(`/admin/content/${savedTask.contentId}`);
    }

    redirect(
      `/admin/ai-editorial/${savedTask.id}?notice=${encodeURIComponent(
        aiEditorialIntentLabels[intent],
      )}`,
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === "error"
    ) {
      return error as AiTaskFormState;
    }

    return {
      status: "error",
      message: getErrorMessage(error),
    };
  }
}
