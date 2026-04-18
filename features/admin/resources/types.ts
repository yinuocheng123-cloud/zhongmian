/**
 * 文件说明：该文件定义后台资源管理模块的共享类型。
 * 功能说明：统一表单状态、筛选参数、默认表单值以及流程面板所需的数据结构，降低三类资源页面的重复成本。
 *
 * 结构概览：
 *   第一部分：表单与列表查询类型
 *   第二部分：资源表单默认值
 *   第三部分：流程层展示类型
 */

import type {
  AiTaskStatus,
  AiTaskType,
  ContentType,
  WorkflowStatus,
} from "@prisma/client";

export type ResourceFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialResourceFormState: ResourceFormState = {
  status: "idle",
};

export type ResourceListQuery = {
  q?: string;
  status?: WorkflowStatus | "";
};

export type ContentFormValues = {
  id?: string;
  title: string;
  slug: string;
  contentType: ContentType;
  summary: string;
  body: string;
  workflowStatus?: WorkflowStatus;
};

export type TermFormValues = {
  id?: string;
  name: string;
  slug: string;
  aliases: string;
  shortDefinition: string;
  definition: string;
  body: string;
  workflowStatus?: WorkflowStatus;
};

export type BrandFormValues = {
  id?: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  website: string;
  region: string;
  city: string;
  workflowStatus?: WorkflowStatus;
};

export const emptyContentFormValues: ContentFormValues = {
  title: "",
  slug: "",
  contentType: "KNOWLEDGE",
  summary: "",
  body: "",
  workflowStatus: "DRAFT",
};

export const emptyTermFormValues: TermFormValues = {
  name: "",
  slug: "",
  aliases: "",
  shortDefinition: "",
  definition: "",
  body: "",
  workflowStatus: "DRAFT",
};

export const emptyBrandFormValues: BrandFormValues = {
  name: "",
  slug: "",
  summary: "",
  description: "",
  website: "",
  region: "",
  city: "",
  workflowStatus: "DRAFT",
};

export type WorkflowHistoryItem = {
  id: string;
  fromStatus: WorkflowStatus | null;
  toStatus: WorkflowStatus;
  note: string | null;
  actorName: string | null;
  createdAt: Date;
};

export type ContentVersionItem = {
  id: string;
  versionNumber: number;
  titleSnapshot: string;
  changeNote: string | null;
  createdBy: string | null;
  createdAt: Date;
};

export type AiTaskSummaryItem = {
  id: string;
  taskType: AiTaskType;
  status: AiTaskStatus;
  modelName: string | null;
  createdAt: Date;
  finishedAt: Date | null;
};

export type ContentEditorData = {
  formValues: ContentFormValues;
  workflowHistory: WorkflowHistoryItem[];
  versions: ContentVersionItem[];
  aiTasks: AiTaskSummaryItem[];
};

export type TermEditorData = {
  formValues: TermFormValues;
  workflowHistory: WorkflowHistoryItem[];
};

export type BrandEditorData = {
  formValues: BrandFormValues;
  workflowHistory: WorkflowHistoryItem[];
};
