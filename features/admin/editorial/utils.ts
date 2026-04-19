/**
 * 文件说明：该文件实现 AI 编辑部模块的通用工具函数。
 * 功能说明：统一处理任务输入载荷的兼容解析、关键词字符串处理，以及旧版载荷向新版结构化输入的平滑过渡。
 *
 * 结构概览：
 *   第一部分：关键词解析工具
 *   第二部分：任务载荷兼容解析
 */

import type { ContentType, Prisma } from "@prisma/client";
import type {
  LegacyAiTaskPayload,
  NormalizedAiTaskPayload,
} from "@/features/admin/editorial/types";

const fallbackPayload: NormalizedAiTaskPayload = {
  templateId: "content-knowledge",
  templateName: "睡眠知识科普稿",
  targetKind: "CONTENT",
  input: {
    title: "",
    topic: "",
    keywords: [],
    contentType: "KNOWLEDGE",
    generationGoal: "科普",
    notes: "",
    shouldCreateDraft: true,
  },
};

function isContentType(value: unknown): value is ContentType {
  return (
    typeof value === "string" &&
    [
      "ARTICLE",
      "KNOWLEDGE",
      "TOPIC",
      "GUIDE",
      "REPORT",
      "THINK_TANK",
      "STANDARD",
      "RANKING",
      "INDEX",
    ].includes(value)
  );
}

function normalizeLegacyPayload(payload: LegacyAiTaskPayload): NormalizedAiTaskPayload {
  return {
    templateId: "legacy-freeform",
    templateName: "旧版自由输入任务",
    targetKind: "CONTENT",
    input: {
      title: payload.title,
      topic: payload.direction,
      keywords: [],
      contentType: payload.desiredContentType,
      generationGoal: "科普",
      notes: payload.notes,
      shouldCreateDraft: payload.shouldCreateDraft,
    },
  };
}

export function parseKeywordsInput(value: string) {
  return value
    .split(/[\n,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function formatKeywordsInput(value: string[]) {
  return value.join("、");
}

export function parseAiTaskPayload(
  payload: Prisma.JsonValue | null | undefined,
): NormalizedAiTaskPayload {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return fallbackPayload;
  }

  const record = payload as Record<string, unknown>;

  if (record.schemaVersion === "v2") {
    const input =
      typeof record.input === "object" &&
      record.input !== null &&
      !Array.isArray(record.input)
        ? (record.input as Record<string, unknown>)
        : {};

    return {
      templateId:
        typeof record.templateId === "string" && record.templateId.trim()
          ? record.templateId
          : fallbackPayload.templateId,
      templateName:
        typeof record.templateName === "string" && record.templateName.trim()
          ? record.templateName
          : fallbackPayload.templateName,
      targetKind:
        record.targetKind === "CONTENT" ||
        record.targetKind === "TERM" ||
        record.targetKind === "BRAND"
          ? record.targetKind
          : fallbackPayload.targetKind,
      input: {
        title: typeof input.title === "string" ? input.title : fallbackPayload.input.title,
        topic: typeof input.topic === "string" ? input.topic : fallbackPayload.input.topic,
        keywords: Array.isArray(input.keywords)
          ? input.keywords.filter((item): item is string => typeof item === "string")
          : fallbackPayload.input.keywords,
        contentType: isContentType(input.contentType)
          ? input.contentType
          : fallbackPayload.input.contentType,
        generationGoal:
          typeof input.generationGoal === "string" && input.generationGoal.trim()
            ? input.generationGoal
            : fallbackPayload.input.generationGoal,
        notes: typeof input.notes === "string" ? input.notes : fallbackPayload.input.notes,
        shouldCreateDraft:
          typeof input.shouldCreateDraft === "boolean"
            ? input.shouldCreateDraft
            : fallbackPayload.input.shouldCreateDraft,
      },
    };
  }

  return normalizeLegacyPayload({
    title: typeof record.title === "string" ? record.title : "",
    direction: typeof record.direction === "string" ? record.direction : "",
    notes: typeof record.notes === "string" ? record.notes : "",
    shouldCreateDraft:
      typeof record.shouldCreateDraft === "boolean"
        ? record.shouldCreateDraft
        : true,
    desiredContentType: isContentType(record.desiredContentType)
      ? record.desiredContentType
      : "KNOWLEDGE",
  });
}
