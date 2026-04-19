/**
 * 文件说明：该文件实现后台词条列表页。
 * 功能说明：展示真实 Term 数据，支持搜索、状态筛选、前台查看与快速状态切换。
 *
 * 结构概览：
 *   第一部分：依赖导入与查询参数工具
 *   第二部分：词条列表页实现
 */

import Link from "next/link";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ResourceStatusBadge } from "@/components/admin/resource-status-badge";
import { ResourceToolbar } from "@/components/admin/resource-toolbar";
import { changeResourceWorkflowStatusAction } from "@/features/admin/resources/actions";
import { getTermList } from "@/features/admin/resources/server";
import { formatDateTime } from "@/features/admin/resources/utils";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
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
  const result = await getTermList({ q, status: status as never });

  return (
    <div className="space-y-6">
      {notice ? (
        <AdminNotice tone="success" title="操作成功" description={notice} />
      ) : null}

      {errorMessage ? (
        <AdminNotice tone="error" title="操作失败" description={errorMessage} />
      ) : null}

      <ResourceToolbar resource="term" q={q} status={status} />

      {result.error ? (
        <AdminNotice
          tone={result.databaseReady ? "error" : "info"}
          title={result.databaseReady ? "词条列表读取失败" : "词条列表当前为只读模式"}
          description={result.error}
        />
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-line bg-white">
        <div className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr_0.8fr_1.2fr] gap-4 border-b border-line bg-surface-soft px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
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
                className="grid grid-cols-[1.2fr_1.5fr_1fr_0.8fr_0.8fr_1.2fr] gap-4 px-6 py-5 text-sm text-foreground"
              >
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
                      疑似测试残留，禁止直接发布
                    </p>
                  ) : null}
                </div>

                <p className="line-clamp-3 text-sm text-muted">
                  {item.shortDefinition ?? "暂无一句话定义"}
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
                    <form
                      action={changeResourceWorkflowStatusAction.bind(
                        null,
                        "term",
                        item.id,
                        "SUBMIT_REVIEW",
                        "/admin/terms",
                      )}
                    >
                      <button
                        type="submit"
                        className="inline-flex rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
                      >
                        提审
                      </button>
                    </form>
                  ) : null}

                  {item.workflowStatus !== "PUBLISHED" ? (
                    <form
                      action={changeResourceWorkflowStatusAction.bind(
                        null,
                        "term",
                        item.id,
                        "PUBLISH",
                        "/admin/terms",
                      )}
                    >
                      <button
                        type="submit"
                        className="inline-flex rounded-xl border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50"
                      >
                        发布
                      </button>
                    </form>
                  ) : null}

                  {item.workflowStatus === "PUBLISHED" ? (
                    <form
                      action={changeResourceWorkflowStatusAction.bind(
                        null,
                        "term",
                        item.id,
                        "UNPUBLISH",
                        "/admin/terms",
                      )}
                    >
                      <button
                        type="submit"
                        className="inline-flex rounded-xl border border-rose-200 px-3 py-2 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                      >
                        下线
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-muted">
            当前还没有可展示的词条数据，可以先新建一条词条跑通后台流程。
          </div>
        )}
      </section>
    </div>
  );
}
