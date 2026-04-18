/**
 * 文件说明：该文件实现 AI 编辑部任务编辑页。
 * 功能说明：展示 AI 任务表单、关联 Content 挂接状态和当前占位产出，帮助任务流与内容流转形成最小连接。
 *
 * 结构概览：
 *   第一部分：导入依赖与参数工具
 *   第二部分：编辑页实现
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AiTaskForm } from "@/components/admin/ai-task-form";
import { AiTaskStatusBadge } from "@/components/admin/ai-task-status-badge";
import { getAiTaskEditorData } from "@/features/admin/editorial/server";
import { formatDateTime } from "@/features/admin/resources/utils";
import {
  workflowStatusLabels,
} from "@/features/admin/resources/constants";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingleParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminAiEditorialDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const notice = getSingleParam(resolvedSearchParams, "notice");
  const result = await getAiTaskEditorData(id);

  if (result.databaseReady && !result.data) {
    notFound();
  }

  if (!result.data) {
    return (
      <AdminNotice
        tone="info"
        title="当前无法读取 AI 任务详情"
        description={result.error ?? "数据库尚未就绪，因此暂时无法进入真实编辑状态。"}
      />
    );
  }

  return (
    <div className="space-y-6">
      {notice ? (
        <AdminNotice
          tone="success"
          title="操作成功"
          description={`当前 AI 任务已完成：${notice}`}
        />
      ) : null}

      {result.error ? (
        <AdminNotice
          tone={result.databaseReady ? "error" : "info"}
          title={result.databaseReady ? "AI 任务读取失败" : "当前为只读模式"}
          description={result.error}
        />
      ) : null}

      <section className="rounded-[28px] border border-line bg-white p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              编辑 AI 任务
            </h2>
            <p className="text-sm leading-7 text-muted">
              这里负责 AI 编辑部的前段任务流：选题、占位稿生成和 Content 草稿挂接。
              正式发布仍由 Content 原有工作流负责。
            </p>
          </div>
          {result.data.formValues.status ? (
            <AiTaskStatusBadge status={result.data.formValues.status} />
          ) : null}
        </div>
        <AiTaskForm
          initialValues={result.data.formValues}
          contentOptions={result.data.contentOptions}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="rounded-[28px] border border-line bg-white p-6">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            关联 Content 挂接
          </h3>
          <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
            {result.data.content ? (
              <>
                <p>
                  当前任务已挂接内容草稿：
                  <span className="ml-1 font-medium text-foreground">
                    {result.data.content.title}
                  </span>
                </p>
                <p>
                  状态：
                  <span className="ml-1">
                    {workflowStatusLabels[result.data.content.workflowStatus]}
                  </span>
                </p>
                <p>Slug：{result.data.content.slug}</p>
                <Link
                  href={`/admin/content/${result.data.content.id}`}
                  className="inline-flex rounded-2xl border border-line px-4 py-2 font-medium text-foreground transition hover:border-brand hover:text-brand"
                >
                  进入内容编辑页
                </Link>
              </>
            ) : (
              <p>
                当前任务尚未挂接 Content。勾选“自动创建草稿”后执行“生成占位稿”，即可把 AI 编辑部任务接入内容生产流。
              </p>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-line bg-white p-6">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            当前任务说明
          </h3>
          <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
            <p>状态：{result.data.formValues.status ?? "待生成"}</p>
            <p>占位输出长度：{result.data.formValues.outputText.length} 字符</p>
            <p>创建时间：{formatDateTime(result.data.createdAt)}</p>
            <p>
              挂接策略：
              {result.data.formValues.shouldCreateDraft
                ? "允许在无关联内容时自动创建草稿"
                : "仅关联已有内容，不自动创建草稿"}
            </p>
            <p>最后更新时间：{formatDateTime(result.data.updatedAt)}</p>
            <p>完成时间：{formatDateTime(result.data.finishedAt)}</p>
          </div>
        </section>
      </section>
    </div>
  );
}
