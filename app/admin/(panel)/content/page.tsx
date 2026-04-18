/**
 * 文件说明：该文件实现后台内容列表页。
 * 功能说明：读取真实 Prisma 数据，展示 Content 列表、状态与基础筛选结构。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：列表页实现
 */

import Link from "next/link";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ResourceStatusBadge } from "@/components/admin/resource-status-badge";
import { ResourceToolbar } from "@/components/admin/resource-toolbar";
import { contentTypeOptions } from "@/features/admin/resources/constants";
import { getContentList } from "@/features/admin/resources/server";
import { formatDateTime } from "@/features/admin/resources/utils";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleParam(
  searchParams: SearchParams,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = getSingleParam(resolvedSearchParams, "q");
  const status = getSingleParam(resolvedSearchParams, "status");
  const result = await getContentList({ q, status: status as never });

  return (
    <div className="space-y-6">
      <ResourceToolbar resource="content" q={q} status={status} />

      {result.error ? (
        <AdminNotice
          tone={result.databaseReady ? "error" : "info"}
          title={result.databaseReady ? "内容列表读取失败" : "内容列表当前为只读模式"}
          description={result.error}
        />
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-line bg-white">
        <div className="grid grid-cols-[1.6fr_0.8fr_0.7fr_0.8fr_0.8fr_0.6fr] gap-4 border-b border-line bg-surface-soft px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <span>内容标题</span>
          <span>类型</span>
          <span>状态</span>
          <span>发布时间</span>
          <span>更新时间</span>
          <span>操作</span>
        </div>

        {result.data.length > 0 ? (
          <div className="divide-y divide-line">
            {result.data.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.6fr_0.8fr_0.7fr_0.8fr_0.8fr_0.6fr] gap-4 px-6 py-5 text-sm text-foreground"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="mt-1 truncate text-xs text-muted">{item.slug}</p>
                </div>
                <span className="text-sm text-muted">
                  {contentTypeOptions.find((option) => option.value === item.contentType)
                    ?.label ?? item.contentType}
                </span>
                <div>
                  <ResourceStatusBadge status={item.workflowStatus} />
                </div>
                <span className="text-sm text-muted">
                  {formatDateTime(item.publishedAt)}
                </span>
                <span className="text-sm text-muted">
                  {formatDateTime(item.updatedAt)}
                </span>
                <div>
                  <Link
                    href={`/admin/content/${item.id}`}
                    className="text-sm font-medium text-brand transition hover:text-brand-strong"
                  >
                    编辑
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-muted">
            当前还没有可展示的内容数据，可以先新建一条内容试运行后台流程。
          </div>
        )}
      </section>
    </div>
  );
}
