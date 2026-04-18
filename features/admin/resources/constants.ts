/**
 * 文件说明：该文件定义后台资源管理模块的共享常量。
 * 功能说明：统一资源名称、状态标签、表单动作和内容类型选项，避免各页面分别维护一套配置。
 *
 * 结构概览：
 *   第一部分：资源与状态常量
 *   第二部分：内容类型与筛选配置
 */

import type { ContentType, WorkflowStatus } from "@prisma/client";

export type ResourceKind = "content" | "term" | "brand";
export type ResourceFormIntent =
  | "SAVE"
  | "SAVE_DRAFT"
  | "SUBMIT_REVIEW"
  | "PUBLISH"
  | "UNPUBLISH";

export const resourceLabels: Record<
  ResourceKind,
  {
    singular: string;
    plural: string;
    listPath: string;
    newPath: string;
  }
> = {
  content: {
    singular: "内容",
    plural: "内容管理",
    listPath: "/admin/content",
    newPath: "/admin/content/new",
  },
  term: {
    singular: "词条",
    plural: "词条管理",
    listPath: "/admin/terms",
    newPath: "/admin/terms/new",
  },
  brand: {
    singular: "品牌",
    plural: "品牌管理",
    listPath: "/admin/brands",
    newPath: "/admin/brands/new",
  },
};

export const workflowStatusLabels: Record<WorkflowStatus, string> = {
  DRAFT: "草稿",
  PENDING_EDIT: "待编辑",
  PENDING_REVIEW: "待审核",
  PUBLISHED: "已发布",
  OFFLINE: "已下线",
};

export const workflowStatusClasses: Record<WorkflowStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_EDIT: "bg-amber-100 text-amber-700",
  PENDING_REVIEW: "bg-orange-100 text-orange-700",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  OFFLINE: "bg-zinc-200 text-zinc-700",
};

export const contentTypeOptions: Array<{
  value: ContentType;
  label: string;
}> = [
  { value: "ARTICLE", label: "文章" },
  { value: "KNOWLEDGE", label: "知识内容" },
  { value: "TOPIC", label: "专题" },
  { value: "GUIDE", label: "指南" },
  { value: "REPORT", label: "报告" },
  { value: "THINK_TANK", label: "智库内容" },
  { value: "STANDARD", label: "标准" },
  { value: "RANKING", label: "榜单" },
  { value: "INDEX", label: "指数" },
];

export const workflowFilterOptions: Array<{
  value: WorkflowStatus;
  label: string;
}> = [
  { value: "DRAFT", label: "草稿" },
  { value: "PENDING_EDIT", label: "待编辑" },
  { value: "PENDING_REVIEW", label: "待审核" },
  { value: "PUBLISHED", label: "已发布" },
  { value: "OFFLINE", label: "已下线" },
];

export const intentLabels: Record<ResourceFormIntent, string> = {
  SAVE: "保存当前内容",
  SAVE_DRAFT: "存为草稿",
  SUBMIT_REVIEW: "提交审核",
  PUBLISH: "审核通过并发布",
  UNPUBLISH: "下线/撤回发布",
};
