/**
 * 文件说明：该文件实现后台品牌列表页。
 * 功能说明：展示真实 Brand 数据，支持搜索、状态筛选、批量流转与前台查看。
 *
 * 结构概览：
 *   第一部分：依赖导入与查询参数工具
 *   第二部分：品牌列表页实现
 */

import Link from "next/link";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ResourceStatusBadge } from "@/components/admin/resource-status-badge";
import { ResourceToolbar } from "@/components/admin/resource-toolbar";
import {
  changeBulkResourceWorkflowStatusAction,
  changeResourceWorkflowStatusAction,
} from "@/features/admin/resources/actions";
import { getBrandList } from "@/features/admin/resources/server";
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
  return queryString ? `/admin/brands?${queryString}` : "/admin/brands";
}

export default async function AdminBrandsPage({
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
  const bulkFormId = "admin-brand-bulk-form";
  const result = await getBrandList({ q, status: status as never });

  return (
    <div className="space-y-6">
      {notice ? (
        <AdminNotice tone="success" title="操作成功" description={notice} />
      ) : null}

      {errorMessage ? (
        <AdminNotice tone="error" title="操作失败" description={errorMessage} />
      ) : null}

      <ResourceToolbar resource="brand" q={q} status={status} />

      {result.error ? (
        <AdminNotice
          tone={result.databaseReady ? "error" : "info"}
          title={result.databaseReady ? "品牌列表读取失败" : "品牌列表当前为只读模式"}
          description={result.error}
        />
      ) : null}

      <form
        id={bulkFormId}
        action={changeBulkResourceWorkflowStatusAction.bind(
          null,
          "brand",
          currentPath,
        )}
        className="space-y-6"
      >
        {result.data.length > 0 ? (
          <div className="rounded-[28px] border border-line bg-surface-soft p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">批量品牌操作</h3>
                <p className="text-sm leading-7 text-muted">
                  适合集中处理品牌收录与上线状态，尤其适用于首批品牌库收口和测试残留清理。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  name="intent"
                  value="SUBMIT_REVIEW"
                  className="rounded-2xl border border-line bg-white px-4 py-3 text-sm font-medium text-foreground transition hover:border-brand hover:text-brand"
                >
                  批量提审
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="PUBLISH"
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 transition hover:border-emerald-300"
                >
                  批量发布
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="UNPUBLISH"
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:border-rose-300"
                >
                  批量下线
                </button>
              </div>
            </div>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[28px] border border-line bg-white">
        <div className="grid grid-cols-[44px_1.1fr_1fr_1fr_0.8fr_0.8fr_1.2fr] gap-4 border-b border-line bg-surface-soft px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <span>选择</span>
          <span>品牌</span>
          <span>主营 / 地区</span>
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
                className="grid grid-cols-[44px_1.1fr_1fr_1fr_0.8fr_0.8fr_1.2fr] gap-4 px-6 py-5 text-sm text-foreground"
              >
                <div className="pt-1">
                  <input
                    type="checkbox"
                    name="resourceIds"
                    value={item.id}
                    className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                    aria-label={`选择品牌 ${item.name}`}
                  />
                </div>

                <div className="min-w-0">
                  <Link
                    href={`/admin/brands/${item.id}`}
                    className="truncate font-medium transition hover:text-brand"
                  >
                    {item.name}
                  </Link>
                  <p className="mt-1 truncate text-xs text-muted">{item.slug}</p>
                  {item.isSuspicious ? (
                    <p className="mt-2 text-xs font-medium text-rose-600">
                      疑似测试残留，禁止直接发布
                    </p>
                  ) : null}
                </div>

                <div className="space-y-2 text-xs text-muted">
                  <p>主营：{item.tagline || "未填写"}</p>
                  <p>
                    地区：{item.region || "未填写"}
                    {item.city ? ` / ${item.city}` : ""}
                  </p>
                </div>

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
                    href={`/admin/brands/${item.id}`}
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
                      formAction={changeResourceWorkflowStatusAction.bind(
                        null,
                        "brand",
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
                      formAction={changeResourceWorkflowStatusAction.bind(
                        null,
                        "brand",
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
                      formAction={changeResourceWorkflowStatusAction.bind(
                        null,
                        "brand",
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
          <div className="px-6 py-12 text-center text-sm text-muted">
            当前还没有可展示的品牌数据，可以先新建一个品牌跑通后台流程。
          </div>
        )}
        </section>
      </form>
    </div>
  );
}
