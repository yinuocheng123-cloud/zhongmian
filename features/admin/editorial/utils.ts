/**
 * 文件说明：该文件实现 AI 编辑部模块的通用工具函数。
 * 功能说明：统一解析任务输入载荷、构造占位内容和格式化标题，避免动作层堆积字符串处理细节。
 *
 * 结构概览：
 *   第一部分：载荷解析工具
 *   第二部分：占位输出生成工具
 */

import type { Prisma } from "@prisma/client";
import type { AiTaskPayload } from "@/features/admin/editorial/types";

export function parseAiTaskPayload(payload: Prisma.JsonValue | null | undefined) {
  const fallback: AiTaskPayload = {
    title: "",
    direction: "",
    notes: "",
    shouldCreateDraft: true,
    desiredContentType: "KNOWLEDGE",
  };

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return fallback;
  }

  return {
    title: typeof payload.title === "string" ? payload.title : fallback.title,
    direction:
      typeof payload.direction === "string" ? payload.direction : fallback.direction,
    notes: typeof payload.notes === "string" ? payload.notes : fallback.notes,
    shouldCreateDraft:
      typeof payload.shouldCreateDraft === "boolean"
        ? payload.shouldCreateDraft
        : fallback.shouldCreateDraft,
    desiredContentType:
      typeof payload.desiredContentType === "string"
        ? (payload.desiredContentType as AiTaskPayload["desiredContentType"])
        : fallback.desiredContentType,
  };
}

export function buildPlaceholderOutput(input: {
  title: string;
  direction: string;
  notes: string;
}) {
  const direction = input.direction.trim() || "待补充内容方向";
  const notes = input.notes.trim() || "当前未补充额外资料备注。";

  return [
    `# ${input.title}`,
    "",
    "## 选题方向",
    direction,
    "",
    "## 占位初稿说明",
    "当前内容由 AI 编辑部最小工作流生成占位稿，用于验证任务流与内容草稿挂接能力。",
    "",
    "## 资料备注",
    notes,
    "",
    "## 下一步人工处理建议",
    "1. 补充来源资料与证据。",
    "2. 完善摘要与结构化小标题。",
    "3. 进入内容审核与发布流转。",
  ].join("\n");
}
