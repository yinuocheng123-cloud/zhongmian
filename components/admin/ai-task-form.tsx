/**
 * 文件说明：该文件实现 AI 编辑部任务表单组件。
 * 功能说明：提供 AI 任务的新建、编辑、状态切换和占位稿生成入口，并与 Content 草稿挂接保持统一交互。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：任务表单组件
 */

"use client";

import { useActionState } from "react";
import { AdminNotice } from "@/components/admin/admin-notice";
import {
  AdminInput,
  AdminSelect,
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
} from "@/features/admin/editorial/types";
import {
  workflowStatusLabels,
} from "@/features/admin/resources/constants";

type AiTaskFormProps = {
  initialValues: AiTaskFormValues;
  contentOptions: ContentOption[];
};

export function AiTaskForm({
  initialValues,
  contentOptions,
}: AiTaskFormProps) {
  const boundAction = saveAiTaskAction.bind(null, initialValues.id ?? null);
  const [state, formAction] = useActionState(
    boundAction,
    initialAiTaskFormState,
  );

  return (
    <form action={formAction} className="space-y-8">
      {state.message ? (
        <AdminNotice tone="error" title="AI 任务保存失败" description={state.message} />
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
        <AdminSelect
          label="任务类型"
          name="taskType"
          defaultValue={initialValues.taskType}
          required
          error={state.fieldErrors?.taskType}
          options={aiTaskTypeOptions}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminSelect
          label="目标内容类型"
          name="desiredContentType"
          defaultValue={initialValues.desiredContentType}
          required
          error={state.fieldErrors?.desiredContentType}
          options={aiEditorialContentTypeOptions}
          description="用于生成新草稿时确定 Content 类型。"
        />
        <label className="flex flex-col gap-2 text-sm text-foreground">
          <span className="font-medium">关联已有 Content</span>
          <select
            name="contentId"
            defaultValue={initialValues.contentId}
            className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
          >
            <option value="">暂不关联，必要时自动创建草稿</option>
            {contentOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title} · {workflowStatusLabels[item.workflowStatus]}
              </option>
            ))}
          </select>
          <span className="text-xs text-muted">
            如果选择了已有内容，占位稿会优先写入该内容；否则可按下方选项自动创建草稿。
          </span>
        </label>
      </div>

      <AdminTextarea
        label="目标内容方向"
        name="direction"
        defaultValue={initialValues.direction}
        required
        rows={4}
        error={state.fieldErrors?.direction}
        description="例如聚焦人群、问题、栏目目标或专题切入点。"
      />

      <AdminTextarea
        label="资料备注"
        name="notes"
        defaultValue={initialValues.notes}
        rows={4}
        description="当前阶段不接模型，这里先沉淀背景资料、关键词和人工补充说明。"
      />

      <label className="flex items-start gap-3 rounded-[24px] border border-line bg-surface-soft p-5 text-sm text-foreground">
        <input
          type="checkbox"
          name="shouldCreateDraft"
          defaultChecked={initialValues.shouldCreateDraft}
          className="mt-1 h-4 w-4 rounded border-line text-brand focus:ring-brand"
        />
        <span className="leading-7">
          生成占位稿时自动创建 Content 草稿。
          这样 AI 编辑部任务就能直接接入现有内容流转，而不是停留在独立演示页。
        </span>
      </label>

      <AdminTextarea
        label="占位输出"
        name="outputText"
        defaultValue={initialValues.outputText}
        rows={10}
        description="点击“生成占位稿”后，这里会写入模拟生成结果，并可同步挂接到 Content 草稿。"
      />

      <div className="rounded-[28px] border border-line bg-surface-soft p-5">
        <p className="text-sm font-semibold text-foreground">AI 编辑部动作</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          当前先跑通最小可用流程：创建选题、进入生成中、写入占位稿、挂接内容草稿。
          内容正式发布仍继续走既有 Content / Workflow 流转。
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
