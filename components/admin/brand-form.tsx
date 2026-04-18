/**
 * 文件说明：该文件实现后台品牌表单组件。
 * 功能说明：提供 Brand 的新建、编辑、基础校验与最小发布流转入口。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：品牌表单组件
 */

"use client";

import { useActionState } from "react";
import { intentLabels } from "@/features/admin/resources/constants";
import {
  initialResourceFormState,
  type BrandFormValues,
} from "@/features/admin/resources/types";
import { saveBrandAction } from "@/features/admin/resources/actions";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AdminInput, AdminTextarea } from "@/components/admin/form-controls";
import { FormSubmitButton } from "@/components/admin/form-submit-button";

type BrandFormProps = {
  initialValues: BrandFormValues;
};

export function BrandForm({ initialValues }: BrandFormProps) {
  const boundAction = saveBrandAction.bind(null, initialValues.id ?? null);
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
          label="品牌名称"
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
          description="留空时会根据品牌名称自动生成。"
          error={state.fieldErrors?.slug}
        />
      </div>

      <AdminTextarea
        label="摘要"
        name="summary"
        defaultValue={initialValues.summary}
        required
        rows={3}
        error={state.fieldErrors?.summary}
      />

      <AdminTextarea
        label="品牌描述"
        name="description"
        defaultValue={initialValues.description}
        required
        rows={8}
        error={state.fieldErrors?.description}
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <AdminInput
          label="官网"
          name="website"
          defaultValue={initialValues.website}
          placeholder="https://example.com"
        />
        <AdminInput
          label="区域"
          name="region"
          defaultValue={initialValues.region}
          placeholder="华东 / 华南 / 华北"
        />
        <AdminInput
          label="城市"
          name="city"
          defaultValue={initialValues.city}
          placeholder="上海 / 深圳 / 成都"
        />
      </div>

      <div className="rounded-[28px] border border-line bg-surface-soft p-5">
        <p className="text-sm font-semibold text-foreground">状态流转</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          品牌管理当前优先服务品牌库与后续企业入驻流程，因此先保证最小可用的保存、提审、发布和下线闭环。
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
