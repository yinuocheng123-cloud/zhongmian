/**
 * 文件说明：该文件实现后台资源管理模块的通用工具函数。
 * 功能说明：统一处理 slug、状态动作映射、发布时间计算和错误消息，保证内容、词条、品牌三类资源行为一致。
 *
 * 结构概览：
 *   第一部分：字符串与状态工具
 *   第二部分：时间与错误处理工具
 */

import type { ResourceFormIntent } from "@/features/admin/resources/constants";
import type { WorkflowStatus } from "@prisma/client";

export function slugify(raw: string) {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-\u4e00-\u9fa5]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function resolveWorkflowStatus(
  intent: ResourceFormIntent,
  currentStatus?: WorkflowStatus | null,
): WorkflowStatus {
  if (intent === "SAVE") {
    return currentStatus ?? "DRAFT";
  }

  const statusMap: Record<Exclude<ResourceFormIntent, "SAVE">, WorkflowStatus> = {
    SAVE_DRAFT: "DRAFT",
    SUBMIT_REVIEW: "PENDING_REVIEW",
    PUBLISH: "PUBLISHED",
    UNPUBLISH: "OFFLINE",
  };

  return statusMap[intent];
}

export function resolvePublishedAt(
  nextStatus: WorkflowStatus,
  currentPublishedAt?: Date | null,
) {
  if (nextStatus === "PUBLISHED") {
    return currentPublishedAt ?? new Date();
  }

  if (
    nextStatus === "DRAFT" ||
    nextStatus === "PENDING_EDIT" ||
    nextStatus === "PENDING_REVIEW" ||
    nextStatus === "OFFLINE"
  ) {
    return null;
  }

  return currentPublishedAt ?? null;
}

export function buildWorkflowNote(
  intent: ResourceFormIntent,
  nextStatus: WorkflowStatus,
) {
  const noteMap: Record<ResourceFormIntent, string> = {
    SAVE: "保存当前内容。",
    SAVE_DRAFT: "保存为草稿。",
    SUBMIT_REVIEW: "提交审核。",
    PUBLISH: "审核通过并发布。",
    UNPUBLISH: "执行下线/撤回发布。",
  };

  return `${noteMap[intent]} 当前状态：${nextStatus}`;
}

export function formatDateTime(value?: Date | null) {
  if (!value) {
    return "未设置";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "发生了未识别的错误，请稍后重试。";
}

export function parseAliases(value: string) {
  return value
    .split(/[\n,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}
