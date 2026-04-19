/**
 * 文件说明：该文件实现后台品牌表单组件。
 * 功能说明：提供 Brand 的新建、编辑、主营方向维护、分类标签管理与状态流转入口。
 *
 * 结构概览：
 *   第一部分：依赖导入
 *   第二部分：品牌表单组件
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
import { intentLabels } from "@/features/admin/resources/constants";
import { saveBrandAction } from "@/features/admin/resources/actions";
import {
  initialResourceFormState,
  type BrandFormValues,
  type TaxonomyOption,
} from "@/features/admin/resources/types";

type BrandFormProps = {
  initialValues: BrandFormValues;
  categoryOptions: TaxonomyOption[];
  tagOptions: TaxonomyOption[];
};

export function BrandForm({
  initialValues,
  categoryOptions,
  tagOptions,
}: BrandFormProps) {
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

      <div className="grid gap-5 lg:grid-cols-2">
        <AdminInput
          label="主营方向"
          name="tagline"
          defaultValue={initialValues.tagline}
          placeholder="例如：睡眠监测 / 睡眠诊疗 / 睡眠产品"
        />
        <AdminDateTimeInput
          label="发布时间"
          name="publishedAt"
          defaultValue={initialValues.publishedAt}
          description="品牌正式展示时可指定发布时间。"
          error={state.fieldErrors?.publishedAt}
        />
      </div>

      <AdminTextarea
        label="简介"
        name="summary"
        defaultValue={initialValues.summary}
        required
        rows={3}
        error={state.fieldErrors?.summary}
      />

      <AdminTextarea
        label="详细介绍"
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
          label="地区"
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

      <AdminCheckboxGroup
        label="品牌分类"
        name="categoryIds"
        options={categoryOptions.map((item) => ({
          label: item.name,
          value: item.id,
          description: item.description,
        }))}
        defaultValues={initialValues.categoryIds}
        description="分类用于品牌目录、行业名录和商业入口运营。"
      />

      <AdminCheckboxGroup
        label="品牌标签"
        name="tagIds"
        options={tagOptions.map((item) => ({
          label: item.name,
          value: item.id,
          description: item.description,
        }))}
        defaultValues={initialValues.tagIds}
        description="标签用于连接主题问题、品牌方向与专题聚合。"
      />

      <div className="rounded-[28px] border border-line bg-surface-soft p-5">
        <p className="text-sm font-semibold text-foreground">状态流转</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          品牌库当前优先服务收录、审核、展示和下线四类操作，满足正式运营与商业承接的最小闭环。
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
