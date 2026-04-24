/**
 * 文件说明：该文件实现后台内容表单组件。
 * 功能说明：提供 Content 的新建、编辑、分类标签管理、发布时间控制与状态流转入口。
 *
 * 结构概览：
 *   第一部分：依赖导入
 *   第二部分：内容表单组件
 */

"use client";

import { useActionState } from "react";
import { AdminNotice } from "@/components/admin/admin-notice";
import {
  AdminCheckboxGroup,
  AdminDateTimeInput,
  AdminInput,
  AdminTextarea,
} from "@/components/admin/form-controls";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { StructuredTextEditor } from "@/components/admin/structured-text-editor";
import {
  contentTypeOptions,
  intentLabels,
} from "@/features/admin/resources/constants";
import { saveContentAction } from "@/features/admin/resources/actions";
import {
  initialResourceFormState,
  type ContentFormValues,
  type TaxonomyOption,
} from "@/features/admin/resources/types";

type ContentFormProps = {
  initialValues: ContentFormValues;
  categoryOptions: TaxonomyOption[];
  tagOptions: TaxonomyOption[];
};

export function ContentForm({
  initialValues,
  categoryOptions,
  tagOptions,
}: ContentFormProps) {
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

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminInput
          label="Slug"
          name="slug"
          defaultValue={initialValues.slug}
          required
          description="支持英文、小写、连字符和中文；留空时会根据标题自动生成。"
          error={state.fieldErrors?.slug}
        />
        <AdminDateTimeInput
          label="发布时间"
          name="publishedAt"
          defaultValue={initialValues.publishedAt}
          description="用于正式发布时间控制；未发布状态下可先留空。"
          error={state.fieldErrors?.publishedAt}
        />
      </div>

      <AdminTextarea
        label="摘要"
        name="summary"
        defaultValue={initialValues.summary}
        required
        rows={4}
        error={state.fieldErrors?.summary}
      />

      <StructuredTextEditor
        label="正文"
        name="body"
        defaultValue={initialValues.body}
        required
        rows={14}
        error={state.fieldErrors?.body}
        description="支持从 Word / WPS 直接粘贴，系统会自动保留标题、段落、列表和强调结构。"
        previewTitle="正文预览"
      />

      <AdminCheckboxGroup
        label="内容分类"
        name="categoryIds"
        options={categoryOptions.map((item) => ({
          label: item.name,
          value: item.id,
          description: item.description,
        }))}
        defaultValues={initialValues.categoryIds}
        description="分类用于知识、行业趋势、专题等运营归类。"
      />

      <AdminCheckboxGroup
        label="标签"
        name="tagIds"
        options={tagOptions.map((item) => ({
          label: item.name,
          value: item.id,
          description: item.description,
        }))}
        defaultValues={initialValues.tagIds}
        description="标签用于关联主题、搜索聚合与相关推荐预留。"
      />

      <div className="rounded-[28px] border border-line bg-surface-soft p-5">
        <p className="text-sm font-semibold text-foreground">状态流转</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          当前支持内容运营最核心的四个状态：草稿、待审核、已发布、已下线。发布后前台可见，下线后前台立即不可见。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <FormSubmitButton intent="SAVE" label={intentLabels.SAVE} tone="primary" />
          <FormSubmitButton intent="SAVE_DRAFT" label={intentLabels.SAVE_DRAFT} />
          <FormSubmitButton
            intent="SUBMIT_REVIEW"
            label={intentLabels.SUBMIT_REVIEW}
            confirmTitle="确认提交审核吗？"
            confirmDescription="提交后内容会进入待审核状态，建议先检查摘要、正文和分类标签是否完整。"
          />
          <FormSubmitButton
            intent="PUBLISH"
            label={intentLabels.PUBLISH}
            confirmTitle="确认发布这条内容吗？"
            confirmDescription="发布后这条内容会立即在前台可见，请确认标题、摘要、正文和发布时间都已准备好。"
          />
          <FormSubmitButton
            intent="UNPUBLISH"
            label={intentLabels.UNPUBLISH}
            tone="danger"
            confirmTitle="确认下线这条内容吗？"
            confirmDescription="下线后前台会立即隐藏这条内容，但后台编辑记录会保留。"
          />
        </div>
      </div>
    </form>
  );
}
