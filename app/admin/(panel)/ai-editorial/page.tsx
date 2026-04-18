/**
 * 文件说明：该文件实现 AI 编辑部任务列表页。
 * 功能说明：读取真实 AiTask 数据，展示任务标题、类型、关联 Content、状态和时间字段，并提供最小搜索与状态筛选。
 *
 * 结构概览：
 *   第一部分：导入依赖与参数工具
 *   第二部分：AI 编辑部列表页实现
 */

import Link from "next/link";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AiTaskStatusBadge } from "@/components/admin/ai-task-status-badge";
import {
  aiTaskStatusLabels,
  aiTaskTypeOptions,
} from "@/features/admin/editorial/constants";
import { getAiTaskList } from "@/features/admin/editorial/server";
import { formatDateTime } from "@/features/admin/resources/utils";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminAiEditorialPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = getSingleParam(resolvedSearchParams, "q");
  const status = getSingleParam(resolvedSearchParams, "status");
  const result = await getAiTaskList({ q, status: status as never });

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-line bg-surface-soft p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              AI 编辑部
            </h2>
            <p className="text-sm leading-7 text-muted">
              当前先打通选题任务、占位稿生成与 Content 草稿挂接，让 AI 编辑部成为内容生产流程的一部分，而不是独立演示页。
            </p>
          </div>
          <Link
            href="/admin/ai-editorial/new"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-medium text-white transition hover:bg-brand-strong"
          >
            新建 AI 任务
          </Link>
        </div>

        <form className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px_120px]">
          <label className="flex flex-col gap-2 text-sm text-foreground">
            <span>搜索</span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="按任务标题、关联内容或占位输出搜索"
              className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-foreground">
            <span>任务状态</span>
            <select
              name="status"
              defaultValue={status}
              className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
            >
              <option value="">全部状态</option>
              {Object.entries(aiTaskStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="h-11 rounded-2xl border border-line bg-white px-5 text-sm font-medium text-foreground transition hover:border-brand hover:text-brand"
          >
            应用筛选
          </button>
        </form>
      </section>

      {result.error ? (
        <AdminNotice
          tone={result.databaseReady ? "error" : "info"}
          title={result.databaseReady ? "AI 任务列表读取失败" : "AI 任务列表当前为只读模式"}
          description={result.error}
        />
      ) : null}

      <section className="overflow-hidden rounded-[28px] border border-line bg-white">
        <div className="grid grid-cols-[1.4fr_0.8fr_1fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 border-b border-line bg-surface-soft px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <span>任务标题</span>
          <span>任务类型</span>
          <span>关联 Content</span>
          <span>当前状态</span>
          <span>创建时间</span>
          <span>更新时间</span>
          <span>操作</span>
        </div>

        {result.data.length > 0 ? (
          <div className="divide-y divide-line">
            {result.data.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.4fr_0.8fr_1fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 px-6 py-5 text-sm text-foreground"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="mt-1 truncate text-xs text-muted">{item.id}</p>
                </div>
                <span className="text-sm text-muted">
                  {aiTaskTypeOptions.find((option) => option.value === item.taskType)
                    ?.label ?? item.taskType}
                </span>
                <div className="min-w-0">
                  {item.content ? (
                    <>
                      <p className="truncate font-medium">{item.content.title}</p>
                      <p className="mt-1 text-xs text-muted">
                        {item.content.workflowStatus}
                      </p>
                    </>
                  ) : (
                    <span className="text-sm text-muted">暂未挂接</span>
                  )}
                </div>
                <div>
                  <AiTaskStatusBadge status={item.status} />
                </div>
                <span className="text-sm text-muted">
                  {formatDateTime(item.createdAt)}
                </span>
                <span className="text-sm text-muted">
                  {formatDateTime(item.updatedAt)}
                </span>
                <div>
                  <Link
                    href={`/admin/ai-editorial/${item.id}`}
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
            当前还没有可展示的 AI 任务数据，可以先新建一条选题任务跑通编辑部工作流。
          </div>
        )}
      </section>
    </div>
  );
}
