/**
 * 文件说明：该文件定义 AI 编辑部模块的共享类型。
 * 功能说明：统一任务表单值、列表结构、编辑页数据和任务输入载荷，便于服务层与页面层复用。
 *
 * 结构概览：
 *   第一部分：表单与载荷类型
 *   第二部分：列表与编辑页类型
 */

import type {
  AiTaskStatus,
  AiTaskType,
  ContentType,
  WorkflowStatus,
} from "@prisma/client";

export type AiTaskFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialAiTaskFormState: AiTaskFormState = {
  status: "idle",
};

export type AiTaskPayload = {
  title: string;
  direction: string;
  notes: string;
  shouldCreateDraft: boolean;
  desiredContentType: ContentType;
};

export type AiTaskFormValues = {
  id?: string;
  title: string;
  taskType: AiTaskType;
  direction: string;
  notes: string;
  shouldCreateDraft: boolean;
  desiredContentType: ContentType;
  contentId: string;
  status?: AiTaskStatus;
  outputText: string;
};

export const emptyAiTaskFormValues: AiTaskFormValues = {
  title: "",
  taskType: "OUTLINE",
  direction: "",
  notes: "",
  shouldCreateDraft: true,
  desiredContentType: "KNOWLEDGE",
  contentId: "",
  status: "PENDING",
  outputText: "",
};

export type AiTaskListQuery = {
  q?: string;
  status?: AiTaskStatus | "";
};

export type ContentOption = {
  id: string;
  title: string;
  slug: string;
  workflowStatus: WorkflowStatus;
};

export type AiTaskListItem = {
  id: string;
  title: string;
  taskType: AiTaskType;
  status: AiTaskStatus;
  createdAt: Date;
  updatedAt: Date;
  finishedAt: Date | null;
  content: {
    id: string;
    title: string;
    workflowStatus: WorkflowStatus;
  } | null;
};

export type AiTaskEditorData = {
  formValues: AiTaskFormValues;
  contentOptions: ContentOption[];
  createdAt: Date;
  updatedAt: Date;
  finishedAt: Date | null;
  content: {
    id: string;
    title: string;
    slug: string;
    workflowStatus: WorkflowStatus;
  } | null;
};
