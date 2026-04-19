/**
 * 文件说明：该文件实现 AI 编辑部任务列表页。
 * 功能说明：读取真实 AiTask 数据，展示任务标题、模板、provider、结构化输入摘要、
 * 生成结果概览、关联 Content 与任务状态，并提供最小可用筛选能力。
 *
 * 结构概览：
 *   第一部分：依赖导入与查询参数工具
 *   第二部分：任务列表页实现
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
        <AdminNotice tone="error" title="操作失败" description={errorMessage} />
      ) : null}

      <section className="rounded-[28px] border border-line bg-surface-soft p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              AI 编辑部
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-muted">
              这里管理中眠网的选题、占位生成与内容挂接任务。运营可以从列表页快速判断：
              哪些任务还在待生成、哪些模板正在使用、哪些任务已经挂到 Content 草稿上。
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
              placeholder="任务标题、模板、关联内容、生成结果片段"
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
        <div className="grid grid-cols-[1.25fr_1fr_1fr_0.75fr_0.8fr_0.55fr] gap-4 border-b border-line bg-surface-soft px-6 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          <span>任务</span>
          <span>模板 / Provider</span>
          <span>结构化输入 / 结果</span>
          <span>关联 Content</span>
          <span>状态 / 时间</span>
          <span>操作</span>
        </div>

        {result.data.length > 0 ? (
          <div className="divide-y divide-line">
            {result.data.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.25fr_1fr_1fr_0.75fr_0.8fr_0.55fr] gap-4 px-6 py-5 text-sm text-foreground"
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
                    Provider：{item.providerId ?? "尚未记录"}
                  </p>
                  <p className="mt-1 truncate">任务 ID：{item.id}</p>
                </div>

                <div className="min-w-0 text-xs leading-6 text-muted">
                  <p className="line-clamp-2">
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
                    </>
                  ) : (
                    <p>未挂接 Content 草稿</p>
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
                    查看
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-12 text-center text-sm text-muted">
            当前还没有可展示的 AI 任务数据，可以先新建一条选题任务打通编辑部流程。
          </div>
        )}
      </section>
    </div>
  );
}
