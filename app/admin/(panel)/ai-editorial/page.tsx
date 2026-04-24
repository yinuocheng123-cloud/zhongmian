/**
 * 文件说明：该文件实现 AI 编辑部任务列表页。
 * 功能说明：读取真实 AiTask 数据，并增强状态、模板、Provider、挂接内容和空状态的可读性。
 *
 * 结构概览：
 *   第一部分：依赖导入与查询参数工具
 *   第二部分：AI 任务列表页实现
 */

import Link from "next/link";
import { AdminListEmptyState } from "@/components/admin/admin-list-empty-state";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AiTaskStatusBadge } from "@/components/admin/ai-task-status-badge";
import {
  aiTaskStatusLabels,
  aiTaskTypeOptions,
  getAiProviderLabel,
} from "@/features/admin/editorial/constants";
import { getAiTaskList } from "@/features/admin/editorial/server";
import { formatDateTime } from "@/features/admin/resources/utils";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleParam(searchParams: SearchParams, key: string) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getTaskTypeLabel(taskType: string) {
  return (
    aiTaskTypeOptions.find((option) => option.value === taskType)?.label ?? taskType
  );
}

export default async function AdminAiEditorialPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = getSingleParam(resolvedSearchParams, "q");
  const status = getSingleParam(resolvedSearchParams, "status");
  const taskType = getSingleParam(resolvedSearchParams, "taskType");
  const provider = getSingleParam(resolvedSearchParams, "provider");
  const notice = getSingleParam(resolvedSearchParams, "notice");
  const errorMessage = getSingleParam(resolvedSearchParams, "error");
  const hasFilters = Boolean(q || status || taskType || provider);
  const result = await getAiTaskList({
    q,
    status: status as never,
    taskType: taskType as never,
    provider,
  });

  return (
    <div className="space-y-6">
      {notice ? (
        <AdminNotice tone="success" title="操作成功" description={notice} />
      ) : null}

      {errorMessage ? (
        <AdminNotice tone="error" title="操作未完成" description={errorMessage} />
      ) : null}

      <section className="rounded-[28px] border border-line bg-surface-soft p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              AI 编辑部
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-muted">
              这里管理中眠网的选题、结构化输入、模拟生成结果和 Content 草稿挂接。列表优先帮助运营看清“任务 → 生成 → 内容”的关系，而不是只看一组任务 ID。
            </p>
          </div>
          <Link
            href="/admin/ai-editorial/new"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-medium text-white transition hover:bg-brand-strong"
          >
            新建 AI 任务
          </Link>
        </div>

        <form className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_180px_180px_180px_120px]">
          <label className="flex flex-col gap-2 text-sm text-foreground">
            <span>搜索</span>
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="任务标题、模板、关联内容、结果片段"
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

          <label className="flex flex-col gap-2 text-sm text-foreground">
            <span>任务类型</span>
            <select
              name="taskType"
              defaultValue={taskType}
              className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
            >
              <option value="">全部类型</option>
              {aiTaskTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-foreground">
            <span>Provider</span>
            <input
              type="text"
              name="provider"
              defaultValue={provider}
              placeholder="如 placeholder-mock"
              className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
            />
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
        <div className="grid grid-cols-[1.25fr_1fr_1fr_0.85fr_0.9fr_0.7fr] gap-4 border-b border-line bg-surface-soft px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <span>任务</span>
          <span>模板 / Provider</span>
          <span>输入 / 输出摘要</span>
          <span>挂接内容</span>
          <span>状态 / 时间</span>
          <span>操作</span>
        </div>

        {result.data.length > 0 ? (
          <div className="divide-y divide-line">
            {result.data.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.25fr_1fr_1fr_0.85fr_0.9fr_0.7fr] gap-4 px-6 py-5 text-sm text-foreground"
              >
                <div className="min-w-0">
                  <Link
                    href={`/admin/ai-editorial/${item.id}`}
                    className="block truncate font-medium transition hover:text-brand"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {getTaskTypeLabel(item.taskType)} / {item.targetKind}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-muted">
                    生成目标：{item.generationGoal}
                  </p>
                </div>

                <div className="min-w-0 text-xs leading-6 text-muted">
                  <p className="truncate font-medium text-foreground">
                    {item.templateName}
                  </p>
                  <p className="mt-1 truncate">
                    Provider：{getAiProviderLabel(item.providerId)}
                  </p>
                  <p className="mt-1 truncate">任务 ID：{item.id}</p>
                </div>

                <div className="min-w-0 text-xs leading-6 text-muted">
                  <p className="line-clamp-3">
                    {item.excerpt || "当前还没有生成结果摘要，可进入详情页执行占位生成。"}
                  </p>
                </div>

                <div className="min-w-0 text-xs leading-6 text-muted">
                  {item.content ? (
                    <>
                      <Link
                        href={`/admin/content/${item.content.id}`}
                        className="block truncate font-medium text-foreground transition hover:text-brand"
                      >
                        {item.content.title}
                      </Link>
                      <p className="mt-1">{item.content.workflowStatus}</p>
                      <Link
                        href={`/admin/content/${item.content.id}`}
                        className="mt-2 inline-flex rounded-xl border border-line px-3 py-1 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
                      >
                        进入内容草稿
                      </Link>
                    </>
                  ) : (
                    <p>当前还没有挂接 Content 草稿</p>
                  )}
                </div>

                <div className="space-y-2">
                  <AiTaskStatusBadge status={item.status} />
                  <p className="text-xs text-muted">
                    创建：{formatDateTime(item.createdAt)}
                  </p>
                  <p className="text-xs text-muted">
                    更新：{formatDateTime(item.updatedAt)}
                  </p>
                </div>

                <div>
                  <Link
                    href={`/admin/ai-editorial/${item.id}`}
                    className="inline-flex rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
                  >
                    查看详情
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AdminListEmptyState
            title={hasFilters ? "未找到符合条件的 AI 任务" : "暂无 AI 任务"}
            description={
              hasFilters
                ? "当前筛选条件下没有找到 AI 任务，可以清空搜索词、状态、类型或 Provider 后再试。"
                : "AI 编辑部当前还是空的，可以先新建一条任务跑通“任务 → 生成 → Content 草稿”的链路。"
            }
            primaryHref={hasFilters ? "/admin/ai-editorial" : "/admin/ai-editorial/new"}
            primaryLabel={hasFilters ? "清空筛选" : "去新建任务"}
            secondaryHref={hasFilters ? "/admin/ai-editorial/new" : undefined}
            secondaryLabel={hasFilters ? "新建任务" : undefined}
          />
        )}
      </section>
    </div>
  );
}
