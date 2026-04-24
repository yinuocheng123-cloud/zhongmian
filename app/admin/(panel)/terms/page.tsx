/**
 * 文件说明：该文件实现后台词条列表页。
 * 功能说明：展示真实 Term 数据，并补齐统一反馈、批量确认、空状态和前台查看入口。
 *
 * 结构概览：
 *   第一部分：依赖导入与查询参数工具
 *   第二部分：列表路径与空状态辅助
 *   第三部分：词条列表页实现
 */

import Link from "next/link";
import { AdminListEmptyState } from "@/components/admin/admin-list-empty-state";
import { AdminNotice } from "@/components/admin/admin-notice";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { ResourceStatusBadge } from "@/components/admin/resource-status-badge";
import { ResourceToolbar } from "@/components/admin/resource-toolbar";
import {
  changeBulkResourceWorkflowStatusActionSafe,
  changeResourceWorkflowStatusActionSafe,
} from "@/features/admin/resources/actions";
import { getTermList } from "@/features/admin/resources/server";
import { formatDateTime } from "@/features/admin/resources/utils";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function buildListPath(params: Record<string, string>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `/admin/terms?${queryString}` : "/admin/terms";
}

export default async function AdminTermsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = getSingleParam(resolvedSearchParams, "q");
  const status = getSingleParam(resolvedSearchParams, "status");
  const notice = getSingleParam(resolvedSearchParams, "notice");
  const errorMessage = getSingleParam(resolvedSearchParams, "error");
  const currentPath = buildListPath({ q, status });
  const hasFilters = Boolean(q || status);
  const bulkFormId = "admin-term-bulk-form";
  const result = await getTermList({ q, status: status as never });

  return (
    <div className="space-y-6">
      {notice ? (
        <AdminNotice tone="success" title="操作成功" description={notice} />
      ) : null}

      {errorMessage ? (
        <AdminNotice tone="error" title="操作未完成" description={errorMessage} />
      ) : null}

      <ResourceToolbar resource="term" q={q} status={status} />

      {result.error ? (
        <AdminNotice
          tone={result.databaseReady ? "error" : "info"}
          title={result.databaseReady ? "词条列表读取失败" : "词条列表当前为只读模式"}
          description={result.error}
        />
      ) : null}

      <form
        id={bulkFormId}
        action={changeBulkResourceWorkflowStatusActionSafe.bind(
          null,
          "term",
          currentPath,
        )}
        className="space-y-6"
      >
        {result.data.length > 0 ? (
          <div className="rounded-[28px] border border-line bg-surface-soft p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">批量词条操作</h3>
                <p className="text-sm leading-7 text-muted">
                  适合集中处理首批词条的审核、发布和下线。系统会反馈成功数量和失败数量，避免运营误以为批量操作全部生效。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <FormSubmitButton
                  intent="SUBMIT_REVIEW"
                  label="批量提交审核"
                  form={bulkFormId}
                  confirmTitle="确认批量提交审核吗？"
                  confirmDescription="提交后所选词条会进入待审核状态，前台仍不可见。"
                />
                <FormSubmitButton
                  intent="PUBLISH"
                  label="批量发布"
                  form={bulkFormId}
                  confirmTitle="确认批量发布吗？"
                  confirmDescription="发布后所选词条会在前台词库中可见，请确认定义内容已经适合公开展示。"
                />
                <FormSubmitButton
                  intent="UNPUBLISH"
                  label="批量下线"
                  tone="danger"
                  form={bulkFormId}
                  confirmTitle="确认批量下线吗？"
                  confirmDescription="下线后所选词条会立即从前台隐藏，但后台记录会保留。"
                />
              </div>
            </div>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[28px] border border-line bg-white">
          <div className="grid grid-cols-[44px_1.2fr_1.5fr_1fr_0.8fr_0.8fr_1.2fr] gap-4 border-b border-line bg-surface-soft px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            <span>选择</span>
            <span>词条</span>
            <span>一句话定义</span>
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
                  className="grid grid-cols-[44px_1.2fr_1.5fr_1fr_0.8fr_0.8fr_1.2fr] gap-4 px-6 py-5 text-sm text-foreground"
                >
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      name="resourceIds"
                      value={item.id}
                      className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                      aria-label={`选择词条 ${item.name}`}
                    />
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/admin/terms/${item.id}`}
                      className="truncate font-medium transition hover:text-brand"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 truncate text-xs text-muted">{item.slug}</p>
                    {item.isSuspicious ? (
                      <p className="mt-2 text-xs font-medium text-rose-600">
                        疑似测试残留，当前不建议直接发布。
                      </p>
                    ) : null}
                  </div>

                  <p className="line-clamp-3 text-sm text-muted">
                    {item.shortDefinition ?? "暂未填写一句话定义"}
                  </p>

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
                      href={`/admin/terms/${item.id}`}
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
                          "term",
                          item.id,
                          "SUBMIT_REVIEW",
                          currentPath,
                        )}
                        className="inline-flex rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
                      >
                        提审
                      </button>
                    ) : null}

                    {item.workflowStatus !== "PUBLISHED" ? (
                      <button
                        type="submit"
                        formAction={changeResourceWorkflowStatusActionSafe.bind(
                          null,
                          "term",
                          item.id,
                          "PUBLISH",
                          currentPath,
                        )}
                        className="inline-flex rounded-xl border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                      >
                        发布
                      </button>
                    ) : null}

                    {item.workflowStatus === "PUBLISHED" ? (
                      <button
                        type="submit"
                        formAction={changeResourceWorkflowStatusActionSafe.bind(
                          null,
                          "term",
                          item.id,
                          "UNPUBLISH",
                          currentPath,
                        )}
                        className="inline-flex rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        下线
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminListEmptyState
              title={hasFilters ? "未找到符合条件的词条" : "暂无词条"}
              description={
                hasFilters
                  ? "当前筛选条件下没有找到词条，可以清空搜索词或状态后再试。"
                  : "词条列表当前还是空的，可以先新建一条词条跑通后台录入和发布流程。"
              }
              primaryHref={hasFilters ? "/admin/terms" : "/admin/terms/new"}
              primaryLabel={hasFilters ? "清空筛选" : "去新建词条"}
              secondaryHref={hasFilters ? "/admin/terms/new" : undefined}
              secondaryLabel={hasFilters ? "新建词条" : undefined}
            />
          )}
        </section>
      </form>
    </div>
  );
}
