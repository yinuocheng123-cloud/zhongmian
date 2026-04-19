/**
 * 文件说明：该文件实现 AI 编辑部任务表单组件。
 * 功能说明：提供 AI 任务的新建、编辑、状态切换与结构化占位生成入口，并根据所选模板约束输入结构。
 *
 * 结构概览：
 *   第一部分：依赖与辅助函数
 *   第二部分：AI 任务表单组件
 */

"use client";

import { useActionState, useMemo, useState } from "react";
import { AdminNotice } from "@/components/admin/admin-notice";
import {
  AdminInput,
  AdminTextarea,
} from "@/components/admin/form-controls";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import {
  aiEditorialContentTypeOptions,
  aiEditorialIntentLabels,
  aiTaskTypeOptions,
} from "@/features/admin/editorial/constants";
import { saveAiTaskAction } from "@/features/admin/editorial/actions";
import {
  initialAiTaskFormState,
  type AiTaskFormValues,
  type ContentOption,
  type PromptTemplateOption,
} from "@/features/admin/editorial/types";
import { workflowStatusLabels } from "@/features/admin/resources/constants";

type AiTaskFormProps = {
  initialValues: AiTaskFormValues;
  contentOptions: ContentOption[];
  templateOptions: PromptTemplateOption[];
};

function buildTemplateDescription(template?: PromptTemplateOption) {
  if (!template) {
    return "请选择一个结构化模板，用于规范输入与模拟生成结果。";
  }

  return `${template.description} 当前模板面向 ${template.targetKind}，支持 ${template.generationGoals.join(" / ")}。`;
}

export function AiTaskForm({
  initialValues,
  contentOptions,
  templateOptions,
}: AiTaskFormProps) {
  const boundAction = saveAiTaskAction.bind(null, initialValues.id ?? null);
  const [state, formAction] = useActionState(
    boundAction,
    initialAiTaskFormState,
  );
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialValues.templateId);
  const [selectedTaskType, setSelectedTaskType] = useState(initialValues.taskType);
  const [selectedContentType, setSelectedContentType] = useState(initialValues.contentType);
  const [selectedGenerationGoal, setSelectedGenerationGoal] = useState(
    initialValues.generationGoal,
  );

  const selectedTemplate = useMemo(
    () =>
      templateOptions.find((template) => template.id === selectedTemplateId) ??
      templateOptions[0],
    [selectedTemplateId, templateOptions],
  );

  const resolvedTaskType = selectedTemplate?.supportedTaskTypes.includes(selectedTaskType)
    ? selectedTaskType
    : selectedTemplate?.defaultTaskType ?? selectedTaskType;
  const resolvedContentType = selectedTemplate?.supportedContentTypes.includes(
    selectedContentType,
  )
    ? selectedContentType
    : selectedTemplate?.supportedContentTypes[0] ?? selectedContentType;
  const resolvedGenerationGoal = selectedTemplate?.generationGoals.includes(
    selectedGenerationGoal,
  )
    ? selectedGenerationGoal
    : selectedTemplate?.generationGoals[0] ?? selectedGenerationGoal;

  const taskTypeSelectOptions = aiTaskTypeOptions.filter((option) =>
    selectedTemplate
      ? selectedTemplate.supportedTaskTypes.includes(option.value)
      : true,
  );

  const templateSelectOptions = templateOptions.map((template) => ({
    value: template.id,
    label: template.name,
  }));

  const contentTypeSelectOptions =
    selectedTemplate?.supportedContentTypes.map((item) => ({
      value: item,
      label:
        aiEditorialContentTypeOptions.find((option) => option.value === item)?.label ??
        item,
    })) ?? [];

  const generationGoalSelectOptions =
    selectedTemplate?.generationGoals.map((item) => ({
      value: item,
      label: item,
    })) ?? [];

  return (
    <form action={formAction} className="space-y-8">
      {state.message ? (
        <AdminNotice
          tone="error"
          title="AI 任务保存失败"
          description={state.message}
        />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminInput
          label="任务标题"
          name="title"
          defaultValue={initialValues.title}
          required
          error={state.fieldErrors?.title}
          description="建议直接表达选题或任务目标，例如“儿童睡眠问题词条补充”。"
        />
        <label className="flex flex-col gap-2 text-sm text-foreground">
          <span className="font-medium">
            提示词模板
            <span className="ml-1 text-rose-500">*</span>
          </span>
          <select
            name="templateId"
            value={selectedTemplateId}
            onChange={(event) => {
              const nextTemplateId = event.target.value;
              const nextTemplate =
                templateOptions.find((template) => template.id === nextTemplateId) ??
                templateOptions[0];

              setSelectedTemplateId(nextTemplateId);
              if (nextTemplate) {
                setSelectedTaskType(nextTemplate.defaultTaskType);
                setSelectedContentType(nextTemplate.supportedContentTypes[0]);
                setSelectedGenerationGoal(nextTemplate.generationGoals[0]);
              }
            }}
            className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
          >
            {templateSelectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">
            {buildTemplateDescription(selectedTemplate)}
          </span>
          {state.fieldErrors?.templateId ? (
            <span className="text-xs text-rose-600">{state.fieldErrors.templateId}</span>
          ) : null}
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <label className="flex flex-col gap-2 text-sm text-foreground">
          <span className="font-medium">
            任务类型
            <span className="ml-1 text-rose-500">*</span>
          </span>
          <select
            name="taskType"
            value={resolvedTaskType}
            onChange={(event) => setSelectedTaskType(event.target.value as typeof selectedTaskType)}
            className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
          >
            {taskTypeSelectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">
            任务类型由模板限制，避免后续真实模型接入时输入过散。
          </span>
          {state.fieldErrors?.taskType ? (
            <span className="text-xs text-rose-600">{state.fieldErrors.taskType}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-sm text-foreground">
          <span className="font-medium">
            内容类型
            <span className="ml-1 text-rose-500">*</span>
          </span>
          <select
            name="contentType"
            value={resolvedContentType}
            onChange={(event) =>
              setSelectedContentType(event.target.value as typeof selectedContentType)
            }
            className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
          >
            {contentTypeSelectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">
            当前模板支持的内容类型会被收敛到有限集合。
          </span>
          {state.fieldErrors?.contentType ? (
            <span className="text-xs text-rose-600">{state.fieldErrors.contentType}</span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-sm text-foreground">
          <span className="font-medium">
            生成目标
            <span className="ml-1 text-rose-500">*</span>
          </span>
          <select
            name="generationGoal"
            value={resolvedGenerationGoal}
            onChange={(event) => setSelectedGenerationGoal(event.target.value)}
            className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
          >
            {generationGoalSelectOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">
            生成目标决定模拟输出的表达方向，例如科普、定义或解释。
          </span>
          {state.fieldErrors?.generationGoal ? (
            <span className="text-xs text-rose-600">
              {state.fieldErrors.generationGoal}
            </span>
          ) : null}
        </label>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminTextarea
          label="生成主题"
          name="topic"
          defaultValue={initialValues.topic}
          required
          rows={4}
          error={state.fieldErrors?.topic}
          description="这里填写本次生成最核心的主题方向，例如“深度睡眠不足的常见原因”。"
        />
        <AdminTextarea
          label="关键词"
          name="keywords"
          defaultValue={initialValues.keywords}
          rows={4}
          description="使用逗号、顿号或换行分隔，后续会写入结构化输入层。"
        />
      </div>

      <AdminTextarea
        label="资料备注"
        name="notes"
        defaultValue={initialValues.notes}
        rows={4}
        description="用于沉淀背景资料、人工约束、来源线索或需要在后续人工补写的说明。"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        <label className="flex items-start gap-3 rounded-[24px] border border-line bg-surface-soft p-5 text-sm text-foreground">
          <input
            type="checkbox"
            name="shouldCreateDraft"
            defaultChecked={initialValues.shouldCreateDraft}
            className="mt-1 h-4 w-4 rounded border-line text-brand focus:ring-brand"
            disabled={selectedTemplate?.targetKind !== "CONTENT"}
          />
          <span className="leading-7">
            {selectedTemplate?.targetKind === "CONTENT"
              ? "生成占位稿时自动创建或补写 Content 草稿，让 AI 编辑部继续走现有内容流转。"
              : "当前模板目标不是 Content，本阶段仅生成结构化占位结果，不自动创建草稿。"}
          </span>
        </label>

        <label className="flex flex-col gap-2 text-sm text-foreground">
          <span className="font-medium">关联已有 Content</span>
          <select
            name="contentId"
            defaultValue={initialValues.contentId}
            disabled={selectedTemplate?.targetKind !== "CONTENT"}
            className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand disabled:bg-surface-soft disabled:text-muted"
          >
            <option value="">暂不关联，必要时自动创建草稿</option>
            {contentOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} / {workflowStatusLabels[item.workflowStatus]}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">
            仅 Content 模板支持直接挂接现有内容，Term / Brand 模板当前先保留任务结果。
          </span>
          {state.fieldErrors?.contentId ? (
            <span className="text-xs text-rose-600">{state.fieldErrors.contentId}</span>
          ) : null}
        </label>
      </div>

      <AdminTextarea
        label="结构化占位输出"
        name="outputText"
        defaultValue={initialValues.outputText}
        rows={12}
        description="点击“生成占位稿”后，这里会写入按模板渲染的模拟结果，方便后续替换真实模型输出。"
      />

      <div className="rounded-[28px] border border-line bg-surface-soft p-5">
        <p className="text-sm font-semibold text-foreground">AI 编辑部动作</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          当前先跑通最小可用流程：创建任务、配置模板、进入生成中、写入结构化占位稿，并在
          Content 模板下挂接现有内容草稿。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <FormSubmitButton
            intent="SAVE"
            label={aiEditorialIntentLabels.SAVE}
            tone="primary"
          />
          <FormSubmitButton
            intent="MARK_PENDING"
            label={aiEditorialIntentLabels.MARK_PENDING}
          />
          <FormSubmitButton
            intent="MARK_RUNNING"
            label={aiEditorialIntentLabels.MARK_RUNNING}
          />
          <FormSubmitButton
            intent="GENERATE_PLACEHOLDER"
            label={aiEditorialIntentLabels.GENERATE_PLACEHOLDER}
          />
        </div>
      </div>
    </form>
  );
}
