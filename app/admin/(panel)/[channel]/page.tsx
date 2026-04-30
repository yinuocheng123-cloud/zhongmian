/**
 * 文件说明：该文件实现后台扩展栏目列表页。
 * 功能说明：复用现有 Content 管理能力，为趋势、事件、品牌进展、榜单、指数、
 * 标准与智库栏目提供统一的列表、批量状态切换和前台查看入口。
 *
 * 结构概览：
 *   第一部分：导入依赖与查询工具
 *   第二部分：扩展栏目列表页实现
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminListEmptyState } from "@/components/admin/admin-list-empty-state";
import { AdminNotice } from "@/components/admin/admin-notice";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { ResourceStatusBadge } from "@/components/admin/resource-status-badge";
import { ResourceToolbar } from "@/components/admin/resource-toolbar";
import {
  changeBulkResourceWorkflowStatusActionSafe,
  changeResourceWorkflowStatusActionSafe,
} from "@/features/admin/resources/actions";
import { contentTypeOptions } from "@/features/admin/resources/constants";
import { getContentList } from "@/features/admin/resources/server";
import { formatDateTime } from "@/features/admin/resources/utils";
import { getManagedChannelBySlug } from "@/lib/site-channels";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function buildListPath(
  basePath: string,
  params: Record<string, string>,
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

type PageProps = {
  params: Promise<{ channel: string }>;
  searchParams?: Promise<SearchParams>;
};

export default async function AdminReservedChannelPage({
  params,
  searchParams,
}: PageProps) {
  const { channel } = await params;
  const config = getManagedChannelBySlug(channel);

  if (!config) {
    notFound();
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = getSingleParam(resolvedSearchParams, "q");
  const status = getSingleParam(resolvedSearchParams, "status");
  const contentType = getSingleParam(resolvedSearchParams, "contentType");
  const notice = getSingleParam(resolvedSearchParams, "notice");
  const errorMessage = getSingleParam(resolvedSearchParams, "error");
  const currentPath = buildListPath(config.adminPath, {
    q,
    status,
    contentType,
  });
  const hasFilters = Boolean(q || status || contentType);
  const bulkFormId = `admin-${config.slug}-bulk-form`;
  const result = await getContentList(
    {
      q,
      status: status as never,
      contentType: contentType as never,
      channelKey: config.channelKey,
    },
    config.adminPath,
  );

  const filteredContentTypeOptions = contentTypeOptions.filter((item) =>
    config.allowedContentTypes.includes(item.value),
  );

  return (
    <div className="space-y-6">
      {notice ? (
        <AdminNotice tone="success" title="操作成功" description={notice} />
      ) : null}

      {errorMessage ? (
        <AdminNotice tone="error" title="操作未完成" description={errorMessage} />
      ) : null}

      <ResourceToolbar
        resource="content"
        q={q}
        status={status}
        contentType={contentType}
        titleOverride={`${config.title}管理`}
        descriptionOverride={`${config.title}继续沿用统一 Content 后台底座，支持搜索、状态切换、批量操作与前台查看入口。`}
        newHref={config.adminNewPath}
        newLabel={`新建${config.shortTitle}内容`}
        contentTypeItems={filteredContentTypeOptions}
        hideContentTypeFilter={filteredContentTypeOptions.length <= 1}
      />

      {result.error ? (
        <AdminNotice
          tone={result.databaseReady ? "error" : "info"}
          title={result.databaseReady ? `${config.title}列表读取失败` : `${config.title}列表当前为只读模式`}
          description={result.error}
        />
      ) : null}

      <form
        id={bulkFormId}
        action={changeBulkResourceWorkflowStatusActionSafe.bind(
          null,
          "content",
          currentPath,
        )}
        className="space-y-6"
      >
        {result.data.length > 0 ? (
          <div className="rounded-[28px] border border-line bg-surface-soft p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">批量栏目操作</h3>
                <p className="text-sm leading-7 text-muted">
                  勾选当前页记录后，可直接批量提交审核、发布或下线。系统会在操作后反馈成功数量和失败数量，方便运营快速收口。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <FormSubmitButton
                  intent="SUBMIT_REVIEW"
                  label="批量提交审核"
                  form={bulkFormId}
                  confirmTitle="确认批量提交审核吗？"
                  confirmDescription="提交后所选内容会进入待审核状态，前台仍不可见。"
                />
                <FormSubmitButton
                  intent="PUBLISH"
                  label="批量发布"
                  form={bulkFormId}
                  confirmTitle="确认批量发布吗？"
                  confirmDescription="发布后所选内容会在前台公开可见，请确认当前勾选项目都适合上线。"
                />
                <FormSubmitButton
                  intent="UNPUBLISH"
                  label="批量下线"
                  tone="danger"
                  form={bulkFormId}
                  confirmTitle="确认批量下线吗？"
                  confirmDescription="下线后所选内容会立即从前台隐藏，但后台记录会保留。"
                />
              </div>
            </div>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[28px] border border-line bg-white">
          <div className="grid grid-cols-[44px_1.5fr_0.8fr_1fr_0.8fr_0.8fr_1.2fr] gap-4 border-b border-line bg-surface-soft px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            <span>选择</span>
            <span>{config.shortTitle}</span>
            <span>类型</span>
            <span>分类 / 标签</span>
            <span>状态</span>
            <span>发布时间</span>
            <span>操作</span>
          </div>

          {result.data.length > 0 ? (
            <div className="divide-y divide-line">
              {result.data.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[44px_1.5fr_0.8fr_1fr_0.8fr_0.8fr_1.2fr] gap-4 px-6 py-5 text-sm text-foreground"
                >
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      name="resourceIds"
                      value={item.id}
                      className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                      aria-label={`选择 ${item.title}`}
                    />
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`${config.adminPath}/${item.id}`}
                      className="truncate font-medium transition hover:text-brand"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 truncate text-xs text-muted">{item.slug}</p>
                    <p className="mt-2 text-xs text-muted">
                      最近更新：{formatDateTime(item.updatedAt)}
                    </p>
                    {item.isSuspicious ? (
                      <p className="mt-2 text-xs font-medium text-rose-600">
                        疑似测试残留，当前不建议直接发布。
                      </p>
                    ) : null}
                  </div>

                  <span className="text-sm text-muted">
                    {contentTypeOptions.find((option) => option.value === item.contentType)
                      ?.label ?? item.contentType}
                  </span>

                  <div className="space-y-2 text-xs text-muted">
                    <p>分类：{item.categoryNames.join(" / ") || "未分类"}</p>
                    <p>标签：{item.tagNames.join(" / ") || "未打标签"}</p>
                  </div>

                  <div>
                    <ResourceStatusBadge status={item.workflowStatus} />
                  </div>

                  <span className="text-sm text-muted">
                    {formatDateTime(item.publishedAt)}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`${config.adminPath}/${item.id}`}
                      className="inline-flex rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
                    >
                      编辑
                    </Link>

                    {item.publicPath ? (
                      <Link
                        href={item.publicPath}
                        target="_blank"
                        className="inline-flex rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
                      >
                        前台查看
                      </Link>
                    ) : null}

                    {item.workflowStatus !== "PENDING_REVIEW" ? (
                      <button
                        type="submit"
                        formAction={changeResourceWorkflowStatusActionSafe.bind(
                          null,
                          "content",
                          item.id,
                          "SUBMIT_REVIEW",
                          currentPath,
                        )}
                        className="inline-flex rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
                      >
                        提交审核
                      </button>
                    ) : null}

                    {item.workflowStatus !== "PUBLISHED" ? (
                      <button
                        type="submit"
                        formAction={changeResourceWorkflowStatusActionSafe.bind(
                          null,
                          "content",
                          item.id,
                          "PUBLISH",
                          currentPath,
                        )}
                        className="inline-flex rounded-xl bg-brand px-3 py-2 text-xs font-medium text-white transition hover:bg-brand-strong"
                      >
                        发布
                      </button>
                    ) : (
                      <button
                        type="submit"
                        formAction={changeResourceWorkflowStatusActionSafe.bind(
                          null,
                          "content",
                          item.id,
                          "UNPUBLISH",
                          currentPath,
                        )}
                        className="inline-flex rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 transition hover:border-rose-300 hover:bg-rose-100"
                      >
                        下线
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminListEmptyState
              title={
                hasFilters
                  ? `没有找到符合条件的${config.title}内容`
                  : `当前还没有${config.title}内容`
              }
              description={
                hasFilters
                  ? "请清空当前筛选条件后重试，或先在后台新建并发布对应内容。"
                  : `你可以先新建首批${config.title}内容，之后再通过审核与发布流转推到前台。`
              }
              primaryHref={config.adminNewPath}
              primaryLabel={`新建${config.shortTitle}内容`}
              secondaryHref={hasFilters ? config.adminPath : undefined}
              secondaryLabel={hasFilters ? "清空筛选" : undefined}
            />
          )}
        </section>
      </form>
    </div>
  );
}
