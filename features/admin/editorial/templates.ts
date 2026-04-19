/**
 * 文件说明：该文件实现 AI 编辑部提示词模板的读取与渲染能力。
 * 功能说明：从 custom 目录读取外置 JSON 模板，统一校验模板结构，并输出可复用的提示词文本与结构化占位稿结果。
 *
 * 结构概览：
 *   第一部分：模板文件读取与标准化
 *   第二部分：模板查询与选项输出
 *   第三部分：提示词与占位稿渲染
 */

import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";
import { AiTaskType, ContentType } from "@prisma/client";
import type {
  PromptTemplateDefinition,
  PromptTemplateInput,
  PromptTemplateOption,
} from "@/features/admin/editorial/types";

const templateDirectory = path.join(
  process.cwd(),
  "custom",
  "ai-editorial",
  "templates",
);

let templateCache: Promise<PromptTemplateDefinition[]> | null = null;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isPromptTemplateSectionArray(
  value: unknown,
): value is PromptTemplateDefinition["outputSections"] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.key === "string" &&
        typeof item.title === "string" &&
        typeof item.instruction === "string",
    )
  );
}

function normalizeAiTaskTypes(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is AiTaskType =>
        typeof item === "string" && Object.values(AiTaskType).includes(item as AiTaskType),
      )
    : [];
}

function normalizeContentTypes(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is ContentType =>
        typeof item === "string" &&
        Object.values(ContentType).includes(item as ContentType),
      )
    : [];
}

function normalizeTemplate(
  rawTemplate: unknown,
  filename: string,
): PromptTemplateDefinition {
  if (typeof rawTemplate !== "object" || rawTemplate === null || Array.isArray(rawTemplate)) {
    throw new Error(`模板文件 ${filename} 结构无效，必须为对象。`);
  }

  const template = rawTemplate as Record<string, unknown>;
  const supportedTaskTypes = normalizeAiTaskTypes(template.supportedTaskTypes);
  const supportedContentTypes = normalizeContentTypes(template.supportedContentTypes);

  if (typeof template.id !== "string" || !template.id.trim()) {
    throw new Error(`模板文件 ${filename} 缺少合法的 id。`);
  }

  if (typeof template.name !== "string" || !template.name.trim()) {
    throw new Error(`模板文件 ${filename} 缺少合法的 name。`);
  }

  if (
    template.targetKind !== "CONTENT" &&
    template.targetKind !== "TERM" &&
    template.targetKind !== "BRAND"
  ) {
    throw new Error(`模板文件 ${filename} 缺少合法的 targetKind。`);
  }

  if (
    typeof template.defaultTaskType !== "string" ||
    !Object.values(AiTaskType).includes(template.defaultTaskType as AiTaskType)
  ) {
    throw new Error(`模板文件 ${filename} 缺少合法的 defaultTaskType。`);
  }

  if (supportedTaskTypes.length === 0) {
    throw new Error(`模板文件 ${filename} 缺少 supportedTaskTypes。`);
  }

  if (supportedContentTypes.length === 0) {
    throw new Error(`模板文件 ${filename} 缺少 supportedContentTypes。`);
  }

  if (!isStringArray(template.generationGoals) || template.generationGoals.length === 0) {
    throw new Error(`模板文件 ${filename} 缺少 generationGoals。`);
  }

  if (!isStringArray(template.promptRules) || template.promptRules.length === 0) {
    throw new Error(`模板文件 ${filename} 缺少 promptRules。`);
  }

  if (
    !isPromptTemplateSectionArray(template.outputSections) ||
    template.outputSections.length === 0
  ) {
    throw new Error(`模板文件 ${filename} 缺少 outputSections。`);
  }

  return {
    id: template.id.trim(),
    name: template.name.trim(),
    description:
      typeof template.description === "string" ? template.description.trim() : "",
    targetKind: template.targetKind,
    defaultTaskType: template.defaultTaskType as AiTaskType,
    supportedTaskTypes,
    supportedContentTypes,
    generationGoals: template.generationGoals.map((item) => item.trim()),
    promptRules: template.promptRules.map((item) => item.trim()),
    outputSections: template.outputSections.map((item) => ({
      key: item.key.trim(),
      title: item.title.trim(),
      instruction: item.instruction.trim(),
    })),
  };
}

async function loadPromptTemplates() {
  const filenames = await fs.readdir(templateDirectory);
  const jsonFiles = filenames.filter((filename) => filename.endsWith(".json")).sort();

  const templates = await Promise.all(
    jsonFiles.map(async (filename) => {
      const filePath = path.join(templateDirectory, filename);
      const content = await fs.readFile(filePath, "utf-8");
      const rawTemplate = JSON.parse(content) as unknown;
      return normalizeTemplate(rawTemplate, filename);
    }),
  );

  return templates;
}

async function getCachedPromptTemplates() {
  if (!templateCache) {
    templateCache = loadPromptTemplates();
  }

  return templateCache;
}

function buildSectionPlaceholder(
  template: PromptTemplateDefinition,
  section: PromptTemplateDefinition["outputSections"][number],
  input: PromptTemplateInput,
) {
  const keywordsText = input.keywords.length > 0 ? input.keywords.join("、") : "待补充关键词";
  const notesText = input.notes.trim() || "当前暂无补充资料备注。";

  return [
    section.instruction,
    "",
    `适用模板：${template.name}`,
    `主题聚焦：${input.topic || "待补充主题"}`,
    `生成目标：${input.generationGoal}`,
    `关键词：${keywordsText}`,
    `内容类型：${input.contentType}`,
    `资料备注：${notesText}`,
  ].join("\n");
}

export async function getPromptTemplates() {
  return getCachedPromptTemplates();
}

export async function getPromptTemplateOptions(): Promise<PromptTemplateOption[]> {
  const templates = await getCachedPromptTemplates();

  return templates.map((template) => ({
    id: template.id,
    name: template.name,
    description: template.description,
    targetKind: template.targetKind,
    defaultTaskType: template.defaultTaskType,
    supportedTaskTypes: template.supportedTaskTypes,
    supportedContentTypes: template.supportedContentTypes,
    generationGoals: template.generationGoals,
  }));
}

export async function getPromptTemplateById(id: string) {
  const templates = await getCachedPromptTemplates();
  return templates.find((template) => template.id === id) ?? null;
}

export function buildPromptFromTemplate(
  template: PromptTemplateDefinition,
  input: PromptTemplateInput,
) {
  const keywordsText = input.keywords.length > 0 ? input.keywords.join("、") : "无";
  const notesText = input.notes.trim() || "无额外资料备注";

  return [
    `模板：${template.name}`,
    `目标实体：${template.targetKind}`,
    `标题：${input.title}`,
    `主题：${input.topic}`,
    `关键词：${keywordsText}`,
    `内容类型：${input.contentType}`,
    `生成目标：${input.generationGoal}`,
    `自动创建草稿：${input.shouldCreateDraft ? "是" : "否"}`,
    `资料备注：${notesText}`,
    "",
    "模板规则：",
    ...template.promptRules.map((rule, index) => `${index + 1}. ${rule}`),
    "",
    "输出结构：",
    ...template.outputSections.map((section, index) => `${index + 1}. ${section.title}`),
  ].join("\n");
}

export function buildStructuredPlaceholderOutput(
  template: PromptTemplateDefinition,
  input: PromptTemplateInput,
) {
  const sections = template.outputSections.map((section) => ({
    key: section.key,
    title: section.title,
    instruction: section.instruction,
    content: buildSectionPlaceholder(template, section, input),
  }));

  const text = [
    `# ${input.title}`,
    "",
    `> 模板：${template.name}`,
    `> 目标：${input.generationGoal}`,
    `> 主题：${input.topic || "待补充主题"}`,
    `> 关键词：${input.keywords.length > 0 ? input.keywords.join("、") : "待补充关键词"}`,
    "",
    ...sections.flatMap((section) => [
      `## ${section.title}`,
      section.content,
      "",
    ]),
    "## 人工编辑建议",
    "1. 校对事实来源与术语边界。",
    "2. 补充证据、案例或品牌资料。",
    "3. 接入现有 Content 审核与发布流转。",
  ].join("\n");

  return {
    text,
    json: {
      schemaVersion: "v1",
      templateId: template.id,
      templateName: template.name,
      targetKind: template.targetKind,
      input,
      sections,
    },
  };
}
