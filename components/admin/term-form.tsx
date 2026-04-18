/**
 * 文件说明：该文件实现后台词条表单组件。
 * 功能说明：提供 Term 的新建、编辑、基础校验与工作流动作入口。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：词条表单组件
 */

"use client";

import { useActionState } from "react";
import { intentLabels } from "@/features/admin/resources/constants";
import {
  initialResourceFormState,
  type TermFormValues,
} from "@/features/admin/resources/types";
import { saveTermAction } from "@/features/admin/resources/actions";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminInput, AdminTextarea } from "@/components/admin/form-controls";
import { FormSubmitButton } from "@/components/admin/form-submit-button";

type TermFormProps = {
  initialValues: TermFormValues;
};

export function TermForm({ initialValues }: TermFormProps) {
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

      <AdminInput
        label="别名"
        name="aliases"
        defaultValue={initialValues.aliases}
        description="可用逗号或换行分隔，例如：OSA, 阻塞性睡眠呼吸暂停"
      />

      <AdminTextarea
        label="短定义"
        name="shortDefinition"
        defaultValue={initialValues.shortDefinition}
        rows={3}
        description="用于列表与卡片摘要展示，可为空。"
      />

      <AdminTextarea
        label="标准定义"
        name="definition"
        defaultValue={initialValues.definition}
        required
        rows={5}
        error={state.fieldErrors?.definition}
      />

      <AdminTextarea
        label="延伸正文"
        name="body"
        defaultValue={initialValues.body}
        rows={10}
        description="用于后续词条详情页的延伸解释、关联问题和补充资料。"
      />

      <div className="rounded-[28px] border border-line bg-surface-soft p-5">
        <p className="text-sm font-semibold text-foreground">状态流转</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          词条当前共用统一工作流骨架，先保证草稿、待审核、已发布和已下线的主流程可操作。
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
