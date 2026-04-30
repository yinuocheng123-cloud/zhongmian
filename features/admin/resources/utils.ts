/**
 * 文件说明：该文件实现后台资源管理模块的通用工具函数。
 * 功能说明：统一处理 slug、状态映射、发布时间、前台路径、可疑测试内容识别与通用格式化逻辑。
 *
 * 结构概览：
 *   第一部分：字符串与状态工具
 *   第二部分：发布时间与日期格式工具
 *   第三部分：前台路径与运营安全工具
 */

import type { ResourceFormIntent } from "@/features/admin/resources/constants";
import type { SiteChannelKey, WorkflowStatus } from "@prisma/client";
import { getContentPublicPath } from "@/lib/site-channels";

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

export function parseDateTimeInput(value: string) {
  if (!value.trim()) {
    return null;
  }

  const normalized = value.trim();
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export function formatDateTimeLocalInput(value?: Date | null) {
  if (!value) {
    return "";
  }

  const offsetMinutes = value.getTimezoneOffset();
  const localDate = new Date(value.getTime() - offsetMinutes * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

export function resolvePublishedAt(params: {
  nextStatus: WorkflowStatus;
  currentPublishedAt?: Date | null;
  requestedPublishedAt?: Date | null;
}) {
  const { nextStatus, currentPublishedAt, requestedPublishedAt } = params;

  if (nextStatus === "PUBLISHED") {
    return requestedPublishedAt ?? currentPublishedAt ?? new Date();
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
    .split(/[\n,，、]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildPublicPath(
  kind: "content" | "term" | "brand",
  slug: string,
  options?: {
    channelKey?: SiteChannelKey | null;
  },
) {
  if (!slug) {
    return null;
  }

  if (kind === "content") {
    return getContentPublicPath({
      slug,
      channelKey: options?.channelKey,
    });
  }

  if (kind === "term") {
    return `/terms/${slug}`;
  }

  return `/brands/${slug}`;
}

const suspiciousContentPatterns = [
  /\?\?\?\?/i,
  /\bverification\b/i,
  /\btest\b/i,
  /\bdemo\b/i,
  /\btemp\b/i,
  /\bplaceholder\b/i,
  /ai verification task/i,
];

export function getSuspiciousPublishReason(value: string) {
  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  const matchedPattern = suspiciousContentPatterns.find((pattern) =>
    pattern.test(normalized),
  );

  if (!matchedPattern) {
    return null;
  }

  return "检测到疑似测试残留内容，当前不允许直接发布，请先修改标题/名称后再发布。";
}
