/**
 * 文件说明：该文件实现后台内容表单组件。
 * 功能说明：基于真实 Server Action 提供 Content 的新建、编辑、校验与状态流转入口。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：内容表单组件
 */

"use client";

import { useActionState } from "react";
import {
  contentTypeOptions,
  intentLabels,
} from "@/features/admin/resources/constants";
import {
  initialResourceFormState,
  type ContentFormValues,
} from "@/features/admin/resources/types";
import { saveContentAction } from "@/features/admin/resources/actions";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminInput, AdminTextarea } from "@/components/admin/form-controls";
import { FormSubmitButton } from "@/components/admin/form-submit-button";

type ContentFormProps = {
  initialValues: ContentFormValues;
};

export function ContentForm({ initialValues }: ContentFormProps) {
  const boundAction = saveContentAction.bind(null, initialValues.id ?? null);
  const [state, formAction] = useActionState(
    boundAction,
    initialResourceFormState,
  );

  return (
    <form action={formAction} className="space-y-8">
      {state.message ? (
        <AdminNotice tone="error" title="保存失败" description={state.message} />
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminInput
          label="标题"
          name="title"
          defaultValue={initialValues.title}
          required
          error={state.fieldErrors?.title}
        />
        <label className="flex flex-col gap-2 text-sm text-foreground">
          <span className="font-medium">
            内容类型
            <span className="ml-1 text-rose-500">*</span>
          </span>
          <select
            name="contentType"
            defaultValue={initialValues.contentType}
            className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
          >
            {contentTypeOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          {state.fieldErrors?.contentType ? (
            <span className="text-xs text-rose-600">
              {state.fieldErrors.contentType}
            </span>
          ) : null}
        </label>
      </div>

      <AdminInput
        label="Slug"
        name="slug"
        defaultValue={initialValues.slug}
        required
        description="建议使用英文、小写和连字符。留空时会根据标题自动生成。"
        error={state.fieldErrors?.slug}
      />

      <AdminTextarea
        label="摘要"
        name="summary"
        defaultValue={initialValues.summary}
        required
        rows={4}
        error={state.fieldErrors?.summary}
      />

      <AdminTextarea
        label="正文"
        name="body"
        defaultValue={initialValues.body}
        required
        rows={12}
        error={state.fieldErrors?.body}
      />

      <div className="rounded-[28px] border border-line bg-surface-soft p-5">
        <p className="text-sm font-semibold text-foreground">状态流转</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          当前实现的是最小可用流程：保存当前内容、存为草稿、提交审核、审核发布和下线撤回。
          复杂审批与操作日志会在后续版本继续叠加。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <FormSubmitButton intent="SAVE" label={intentLabels.SAVE} tone="primary" />
          <FormSubmitButton intent="SAVE_DRAFT" label={intentLabels.SAVE_DRAFT} />
          <FormSubmitButton
            intent="SUBMIT_REVIEW"
            label={intentLabels.SUBMIT_REVIEW}
          />
          <FormSubmitButton intent="PUBLISH" label={intentLabels.PUBLISH} />
          <FormSubmitButton
            intent="UNPUBLISH"
            label={intentLabels.UNPUBLISH}
            tone="danger"
          />
        </div>
      </div>
    </form>
  );
}
