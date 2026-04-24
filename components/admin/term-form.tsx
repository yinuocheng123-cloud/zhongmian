/**
 * 文件说明：该文件实现后台词条表单组件。
 * 功能说明：提供 Term 的新建、编辑、词条定义维护、分类标签管理与状态流转入口。
 *
 * 结构概览：
 *   第一部分：依赖导入
 *   第二部分：词条表单组件
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
import { intentLabels } from "@/features/admin/resources/constants";
import { saveTermAction } from "@/features/admin/resources/actions";
import {
  initialResourceFormState,
  type TaxonomyOption,
  type TermFormValues,
} from "@/features/admin/resources/types";

type TermFormProps = {
  initialValues: TermFormValues;
  categoryOptions: TaxonomyOption[];
  tagOptions: TaxonomyOption[];
};

export function TermForm({
  initialValues,
  categoryOptions,
  tagOptions,
}: TermFormProps) {
  const boundAction = saveTermAction.bind(null, initialValues.id ?? null);
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
          label="词条名称"
          name="name"
          defaultValue={initialValues.name}
          required
          error={state.fieldErrors?.name}
        />
        <AdminInput
          label="Slug"
          name="slug"
          defaultValue={initialValues.slug}
          required
          description="留空时会根据词条名称自动生成。"
          error={state.fieldErrors?.slug}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminInput
          label="别名"
          name="aliases"
          defaultValue={initialValues.aliases}
          description="可使用逗号、顿号或换行分隔。"
        />
        <AdminDateTimeInput
          label="发布时间"
          name="publishedAt"
          defaultValue={initialValues.publishedAt}
          description="词条正式发布时可指定时间。"
          error={state.fieldErrors?.publishedAt}
        />
      </div>

      <AdminTextarea
        label="一句话定义"
        name="shortDefinition"
        defaultValue={initialValues.shortDefinition}
        rows={3}
        description="用于列表页、卡片和词条精选摘要。"
        error={state.fieldErrors?.shortDefinition}
      />

      <StructuredTextEditor
        label="标准定义"
        name="definition"
        defaultValue={initialValues.definition}
        required
        rows={7}
        error={state.fieldErrors?.definition}
        description="支持从 Word / WPS 直接粘贴，并自动整理为定义、解释和分点说明结构。"
        previewTitle="定义预览"
      />

      <StructuredTextEditor
        label="详细解释"
        name="body"
        defaultValue={initialValues.body}
        rows={10}
        description="支持从 Word / WPS 直接粘贴，用于承载词条的详细背景、相关场景与延伸解释。"
        previewTitle="详细解释预览"
      />

      <AdminCheckboxGroup
        label="词条分类"
        name="categoryIds"
        options={categoryOptions.map((item) => ({
          label: item.name,
          value: item.id,
          description: item.description,
        }))}
        defaultValues={initialValues.categoryIds}
        description="分类用于把词条组织成术语目录和知识节点树。"
      />

      <AdminCheckboxGroup
        label="词条标签"
        name="tagIds"
        options={tagOptions.map((item) => ({
          label: item.name,
          value: item.id,
          description: item.description,
        }))}
        defaultValues={initialValues.tagIds}
        description="标签用于连接问题、品牌、专题与未来的相关词条。"
      />

      <div className="rounded-[28px] border border-line bg-surface-soft p-5">
        <p className="text-sm font-semibold text-foreground">状态流转</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          词条共用统一发布流转，先保证草稿、待审核、已发布、已下线四个主状态可稳定运营。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <FormSubmitButton intent="SAVE" label={intentLabels.SAVE} tone="primary" />
          <FormSubmitButton intent="SAVE_DRAFT" label={intentLabels.SAVE_DRAFT} />
          <FormSubmitButton
            intent="SUBMIT_REVIEW"
            label={intentLabels.SUBMIT_REVIEW}
            confirmTitle="确认提交审核吗？"
            confirmDescription="提交后词条会进入待审核状态，建议先补全一句话定义和标准定义。"
          />
          <FormSubmitButton
            intent="PUBLISH"
            label={intentLabels.PUBLISH}
            confirmTitle="确认发布这条词条吗？"
            confirmDescription="发布后词条会立即在前台词库中可见，请确认定义已经准确、清晰。"
          />
          <FormSubmitButton
            intent="UNPUBLISH"
            label={intentLabels.UNPUBLISH}
            tone="danger"
            confirmTitle="确认下线这条词条吗？"
            confirmDescription="下线后前台会立即隐藏这条词条，但后台编辑记录会保留。"
          />
        </div>
      </div>
    </form>
  );
}
