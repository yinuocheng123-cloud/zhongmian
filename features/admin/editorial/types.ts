/**
 * 文件说明：该文件定义 AI 编辑部模块的共享类型。
 * 功能说明：统一任务表单值、模板结构、结构化输入载荷、列表数据与编辑页数据，供服务层、动作层和页面层复用。
 *
 * 结构概览：
 *   第一部分：模板与输入结构类型
 *   第二部分：任务表单与兼容载荷类型
 *   第三部分：列表与编辑页数据类型
 */

import type {
  AiTaskStatus,
  AiTaskType,
  ContentType,
  WorkflowStatus,
} from "@prisma/client";

export type PromptTemplateTargetKind = "CONTENT" | "TERM" | "BRAND";

export type PromptTemplateSection = {
  key: string;
  title: string;
  instruction: string;
};

export type PromptTemplateDefinition = {
  id: string;
  name: string;
  description: string;
  targetKind: PromptTemplateTargetKind;
  defaultTaskType: AiTaskType;
  supportedTaskTypes: AiTaskType[];
  supportedContentTypes: ContentType[];
  generationGoals: string[];
  promptRules: string[];
  outputSections: PromptTemplateSection[];
};

export type PromptTemplateOption = Pick<
  PromptTemplateDefinition,
  | "id"
  | "name"
  | "description"
  | "targetKind"
  | "defaultTaskType"
  | "supportedTaskTypes"
  | "supportedContentTypes"
  | "generationGoals"
>;

export type PromptTemplateInput = {
  title: string;
  topic: string;
  keywords: string[];
  contentType: ContentType;
  generationGoal: string;
  notes: string;
  shouldCreateDraft: boolean;
};

export type StructuredAiTaskPayload = {
  schemaVersion: "v2";
  templateId: string;
  templateName: string;
  targetKind: PromptTemplateTargetKind;
  input: PromptTemplateInput;
};

export type LegacyAiTaskPayload = {
  title: string;
  direction: string;
  notes: string;
  shouldCreateDraft: boolean;
  desiredContentType: ContentType;
};

export type AiTaskPayload = StructuredAiTaskPayload;

export type NormalizedAiTaskPayload = {
  templateId: string;
  templateName: string;
  targetKind: PromptTemplateTargetKind;
  input: PromptTemplateInput;
};

export type AiTaskFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialAiTaskFormState: AiTaskFormState = {
  status: "idle",
};

export type AiTaskFormValues = {
  id?: string;
  title: string;
  templateId: string;
  taskType: AiTaskType;
  topic: string;
  keywords: string;
  contentType: ContentType;
  generationGoal: string;
  notes: string;
  shouldCreateDraft: boolean;
  contentId: string;
  targetKind: PromptTemplateTargetKind;
  status?: AiTaskStatus;
  outputText: string;
};

export const emptyAiTaskFormValues: AiTaskFormValues = {
  title: "",
  templateId: "content-knowledge",
  taskType: "OUTLINE",
  topic: "",
  keywords: "",
  contentType: "KNOWLEDGE",
  generationGoal: "科普",
  notes: "",
  shouldCreateDraft: true,
  contentId: "",
  targetKind: "CONTENT",
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
  templateId: string;
  templateName: string;
  targetKind: PromptTemplateTargetKind;
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
  templateOptions: PromptTemplateOption[];
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
