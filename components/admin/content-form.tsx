/**
 * 文件说明：该文件实现后台 Content 统一编辑表单。
 * 功能说明：在不拆分新系统的前提下，为知识、趋势、事件、品牌进展、榜单、
 * 指数、标准与智库内容提供同一套表单与发布流转入口。
 *
 * 结构概览：
 *   第一部分：依赖与辅助类型
 *   第二部分：频道感知的 Content 表单
 */

"use client";

import { useActionState, useMemo, useState } from "react";
import type { SiteChannelKey } from "@prisma/client";
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
  siteChannelOptions,
} from "@/features/admin/resources/constants";
import { saveContentAction } from "@/features/admin/resources/actions";
import {
  initialResourceFormState,
  type ContentFormValues,
  type TaxonomyOption,
} from "@/features/admin/resources/types";
import { getManagedChannelByKey } from "@/lib/site-channels";

type ContentFormProps = {
  initialValues: ContentFormValues;
  categoryOptions: TaxonomyOption[];
  tagOptions: TaxonomyOption[];
  brandOptions: TaxonomyOption[];
  lockedChannelKey?: SiteChannelKey;
  returnBasePath?: string;
};

const channelFieldCopy: Record<
  SiteChannelKey,
  {
    summary: string;
    eventMeta?: {
      eyebrow: string;
      description: string;
    };
    referenceMeta?: {
      eyebrow: string;
      description: string;
    };
    brandMeta?: {
      eyebrow: string;
      description: string;
    };
  }
> = {
  KNOWLEDGE: {
    summary: "面向问题解释、专题和基础知识内容，优先承接知识入口与热门问题入口。",
  },
  TRENDS: {
    summary: "面向趋势解读与行业变化观察，建议突出长期变化、结构判断与数据观察。",
  },
  EVENTS: {
    summary: "面向展会、论坛、发布会与年度事件，建议补齐时间、地点与事件类型。",
    eventMeta: {
      eyebrow: "事件元信息",
      description: "行业事件类内容发布前，建议补齐时间、地点与事件类型，避免退回普通文章。",
    },
  },
  BRAND_PROGRESS: {
    summary: "面向品牌能力变化、产品方向与企业进展，建议至少关联一个品牌主体。",
    brandMeta: {
      eyebrow: "品牌关联",
      description: "品牌进展内容建议直接关联品牌主体，便于品牌页与内容页互相跳转。",
    },
  },
  RANKINGS: {
    summary: "面向榜单说明、评估维度与入榜对象解读，建议将正文写成榜单说明而不是资讯流。",
  },
  INDEXES: {
    summary: "面向指数说明、数据口径与观察结论，当前可以先用结构化正文表达，不强制复杂图表。",
  },
  STANDARDS: {
    summary: "面向标准说明、适用范围与核心条目，建议补齐版本号，保持专业、克制的表达。",
    referenceMeta: {
      eyebrow: "标准版本信息",
      description: "标准类内容发布前建议补齐版本号，用于前台详情和行业参考表达。",
    },
  },
  THINK_TANK: {
    summary: "面向研究、白皮书、报告与观察内容，可与 AI 编辑部的报告型草稿流程打通。",
  },
};

export function ContentForm({
  initialValues,
  categoryOptions,
  tagOptions,
  brandOptions,
  lockedChannelKey,
  returnBasePath = "/admin/content",
}: ContentFormProps) {
  const boundAction = saveContentAction.bind(null, initialValues.id ?? null);
  const [state, formAction] = useActionState(
    boundAction,
    initialResourceFormState,
  );
  const [selectedChannelKey, setSelectedChannelKey] = useState<SiteChannelKey>(
    lockedChannelKey ?? initialValues.channelKey,
  );

  const effectiveChannelKey = lockedChannelKey ?? selectedChannelKey;
  const channelCopy = useMemo(
    () => channelFieldCopy[effectiveChannelKey],
    [effectiveChannelKey],
  );
  const shouldShowEventMeta = effectiveChannelKey === "EVENTS";
  const shouldShowReferenceMeta = effectiveChannelKey === "STANDARDS";
  const shouldShowBrandMeta = effectiveChannelKey === "BRAND_PROGRESS";
  const currentManagedChannel =
    effectiveChannelKey === "KNOWLEDGE"
      ? null
      : getManagedChannelByKey(effectiveChannelKey);
  const availableContentTypeOptions = currentManagedChannel
    ? contentTypeOptions.filter((item) =>
        currentManagedChannel.allowedContentTypes.includes(item.value),
      )
    : contentTypeOptions;

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="returnBasePath" value={returnBasePath} />

      {state.message ? (
        <AdminNotice tone="error" title="保存失败" description={state.message} />
      ) : null}

      <div className="rounded-[24px] border border-line bg-surface-soft p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
          频道定位
        </p>
        <h2 className="mt-3 font-serif text-2xl font-semibold text-foreground">
          {siteChannelOptions.find((item) => item.value === effectiveChannelKey)?.label ??
            effectiveChannelKey}
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">{channelCopy.summary}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <AdminInput
          label="标题"
          name="title"
          defaultValue={initialValues.title}
          required
          error={state.fieldErrors?.title}
        />

        <label className="flex flex-col gap-2 text-sm text-foreground">
          <span className="font-medium">
            栏目归属
            <span className="ml-1 text-rose-500">*</span>
          </span>
          {lockedChannelKey ? (
            <>
              <input type="hidden" name="channelKey" value={lockedChannelKey} />
              <div className="flex h-11 items-center rounded-2xl border border-line bg-surface-soft px-4 text-sm text-foreground">
                {siteChannelOptions.find((item) => item.value === lockedChannelKey)?.label}
              </div>
            </>
          ) : (
            <select
              name="channelKey"
              value={selectedChannelKey}
              onChange={(event) =>
                setSelectedChannelKey(event.target.value as SiteChannelKey)
              }
              className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
            >
              {siteChannelOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          )}
          {state.fieldErrors?.channelKey ? (
            <span className="text-xs text-rose-600">{state.fieldErrors.channelKey}</span>
          ) : null}
        </label>

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
            {availableContentTypeOptions.map((item) => (
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
          description="用于正式发布时间控制；未发布状态下可以先留空。"
          error={state.fieldErrors?.publishedAt}
        />
      </div>

      {shouldShowEventMeta ? (
        <section className="rounded-[24px] border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            {channelCopy.eventMeta?.eyebrow}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            {channelCopy.eventMeta?.description}
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-3">
            <AdminDateTimeInput
              label="事件时间"
              name="eventStartAt"
              defaultValue={initialValues.eventStartAt}
              error={state.fieldErrors?.eventStartAt}
            />
            <AdminInput
              label="事件地点"
              name="eventLocation"
              defaultValue={initialValues.eventLocation}
              error={state.fieldErrors?.eventLocation}
            />
            <AdminInput
              label="事件类型"
              name="eventKind"
              defaultValue={initialValues.eventKind}
              description="例如：展会、论坛、发布会、年度事件。"
              error={state.fieldErrors?.eventKind}
            />
          </div>
        </section>
      ) : null}

      {shouldShowReferenceMeta ? (
        <section className="rounded-[24px] border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            {channelCopy.referenceMeta?.eyebrow}
          </p>
          <p className="mt-3 text-sm leading-7 text-muted">
            {channelCopy.referenceMeta?.description}
          </p>
          <div className="mt-5">
            <AdminInput
              label="版本号"
              name="referenceVersion"
              defaultValue={initialValues.referenceVersion}
              description="例如：2026 版、V1.0、试行版。"
              error={state.fieldErrors?.referenceVersion}
            />
          </div>
        </section>
      ) : null}

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

      {shouldShowBrandMeta ? (
        <AdminCheckboxGroup
          label="关联品牌"
          name="relatedBrandIds"
          options={brandOptions.map((item) => ({
            label: item.name,
            value: item.id,
            description: item.description,
          }))}
          defaultValues={initialValues.relatedBrandIds}
          description={channelCopy.brandMeta?.description}
          error={state.fieldErrors?.relatedBrandIds}
        />
      ) : null}

      <AdminCheckboxGroup
        label="内容分类"
        name="categoryIds"
        options={categoryOptions.map((item) => ({
          label: item.name,
          value: item.id,
          description: item.description,
        }))}
        defaultValues={initialValues.categoryIds}
        description="分类用于知识、趋势、事件、标准与智库等栏目的运营归类。"
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
        description="标签用于主题聚合、搜索入口与详情页相关推荐。"
      />

      <div className="rounded-[28px] border border-line bg-surface-soft p-5">
        <p className="text-sm font-semibold text-foreground">状态流转</p>
        <p className="mt-2 text-sm leading-7 text-muted">
          当前支持草稿、待审核、已发布与已下线四个核心状态。发布后前台可见，
          下线后前台立即不可见。趋势、事件、榜单、指数、标准与智库内容仍走同一套审核链路。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <FormSubmitButton intent="SAVE" label={intentLabels.SAVE} tone="primary" />
          <FormSubmitButton intent="SAVE_DRAFT" label={intentLabels.SAVE_DRAFT} />
          <FormSubmitButton
            intent="SUBMIT_REVIEW"
            label={intentLabels.SUBMIT_REVIEW}
            confirmTitle="确认提交审核吗？"
            confirmDescription="提交后内容会进入待审核状态，请先检查摘要、正文、分类标签与频道字段是否完整。"
          />
          <FormSubmitButton
            intent="PUBLISH"
            label={intentLabels.PUBLISH}
            confirmTitle="确认发布这条内容吗？"
            confirmDescription="发布后这条内容会立即在前台可见，请确认标题、摘要、正文与频道扩展信息都已准备好。"
          />
          <FormSubmitButton
            intent="UNPUBLISH"
            label={intentLabels.UNPUBLISH}
            tone="danger"
            confirmTitle="确认下线这条内容吗？"
            confirmDescription="下线后前台会立即隐藏这条内容，但后台编辑记录与工作流历史会保留。"
          />
        </div>
      </div>
    </form>
  );
}
