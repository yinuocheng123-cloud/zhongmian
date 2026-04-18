/**
 * 文件说明：该文件定义 AI 编辑部模块共用常量。
 * 功能说明：统一任务类型、任务状态、表单动作和中文标签，避免列表页、表单页与服务层各自维护一套映射。
 *
 * 结构概览：
 *   第一部分：任务类型与状态标签
 *   第二部分：表单动作与默认文案
 */

import type { AiTaskStatus, AiTaskType, ContentType } from "@prisma/client";

export type AiEditorialIntent =
  | "SAVE"
  | "MARK_PENDING"
  | "MARK_RUNNING"
  | "GENERATE_PLACEHOLDER";

export const aiTaskTypeOptions: Array<{
  value: AiTaskType;
  label: string;
}> = [
  { value: "OUTLINE", label: "选题策划" },
  { value: "FIRST_DRAFT", label: "初稿生成" },
  { value: "REWRITE", label: "改写补充" },
  { value: "SEO_META", label: "SEO 摘要" },
  { value: "SUMMARY", label: "资料摘要" },
];

export const aiTaskStatusLabels: Record<AiTaskStatus, string> = {
  PENDING: "待生成",
  RUNNING: "生成中",
  SUCCEEDED: "已生成占位稿",
  FAILED: "生成失败",
  CANCELED: "已取消",
};

export const aiTaskStatusClasses: Record<AiTaskStatus, string> = {
  PENDING: "bg-slate-100 text-slate-700",
  RUNNING: "bg-sky-100 text-sky-700",
  SUCCEEDED: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700",
  CANCELED: "bg-zinc-200 text-zinc-700",
};

export const aiEditorialIntentLabels: Record<AiEditorialIntent, string> = {
  SAVE: "保存任务",
  MARK_PENDING: "置为待生成",
  MARK_RUNNING: "进入生成中",
  GENERATE_PLACEHOLDER: "生成占位稿",
};

export const aiEditorialContentTypeOptions: Array<{
  value: ContentType;
  label: string;
}> = [
  { value: "KNOWLEDGE", label: "知识内容" },
  { value: "ARTICLE", label: "文章" },
  { value: "TOPIC", label: "专题" },
  { value: "GUIDE", label: "指南" },
  { value: "REPORT", label: "报告" },
  { value: "THINK_TANK", label: "智库内容" },
];
