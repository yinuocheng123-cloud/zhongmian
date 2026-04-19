/**
 * 文件说明：该文件实现 AI 编辑部任务详情页。
 * 功能说明：展示任务表单、模板与 provider 信息、结构化输入、生成结果、
 * 关联 Content 草稿与任务状态，帮助运营完成 AI 任务与内容草稿之间的联动。
 *
 * 结构概览：
 *   第一部分：依赖导入与参数工具
 *   第二部分：任务详情页实现
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AiTaskForm } from "@/components/admin/ai-task-form";
import { AiTaskStatusBadge } from "@/components/admin/ai-task-status-badge";
import { getAiTaskEditorData } from "@/features/admin/editorial/server";
import { workflowStatusLabels } from "@/features/admin/resources/constants";
import { formatDateTime } from "@/features/admin/resources/utils";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingleParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function renderKeywords(keywords: string[]) {
  if (keywords.length === 0) {
    return "未填写关键词";
  }

  return keywords.join(" / ");
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

  const { data } = result;

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
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              编辑 AI 任务
            </h2>
            <p className="max-w-3xl text-sm leading-7 text-muted">
              这里负责 AI 编辑部的前段任务流：模板选择、结构化输入、provider 执行结果、
              以及与 Content 草稿的挂接。正式发布仍然由内容流转负责。
            </p>
          </div>
          {data.formValues.status ? (
            <AiTaskStatusBadge status={data.formValues.status} />
          ) : null}
        </div>

        <AiTaskForm
          initialValues={data.formValues}
          contentOptions={data.contentOptions}
          templateOptions={data.templateOptions}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[28px] border border-line bg-white p-6">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            任务与挂接状态
          </h3>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface-soft px-4 py-4">
              <p className="text-sm text-muted">模板名称</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {data.templateName}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface-soft px-4 py-4">
              <p className="text-sm text-muted">Provider</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {data.providerId ?? "尚未执行生成"}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface-soft px-4 py-4">
              <p className="text-sm text-muted">目标实体</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {data.targetKind}
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface-soft px-4 py-4">
              <p className="text-sm text-muted">发布时间点</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                创建：{formatDateTime(data.createdAt)}
              </p>
              <p className="mt-1 text-sm text-muted">
                更新：{formatDateTime(data.updatedAt)}
              </p>
              <p className="mt-1 text-sm text-muted">
                完成：{formatDateTime(data.finishedAt)}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-line p-5">
            <h4 className="text-sm font-semibold text-foreground">
              关联 Content 草稿
            </h4>

            {data.content ? (
              <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
                <p>
                  标题：
                  <span className="ml-1 font-medium text-foreground">
                    {data.content.title}
                  </span>
                </p>
                <p>
                  状态：
                  <span className="ml-1">
                    {workflowStatusLabels[data.content.workflowStatus]}
                  </span>
                </p>
                <p>Slug：{data.content.slug}</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/admin/content/${data.content.id}`}
                    className="inline-flex rounded-2xl border border-line px-4 py-2 font-medium text-foreground transition hover:border-brand hover:text-brand"
                  >
                    进入内容编辑页
                  </Link>
                  {data.content.workflowStatus === "PUBLISHED" ? (
                    <Link
                      href={`/knowledge/${data.content.slug}`}
                      target="_blank"
                      className="inline-flex rounded-2xl border border-line px-4 py-2 font-medium text-foreground transition hover:border-brand hover:text-brand"
                    >
                      前台查看
                    </Link>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-7 text-muted">
                当前任务尚未挂接 Content。对于 Content 模板，只要勾选“自动创建草稿”并执行
                “生成占位稿”，就可以把 AI 编辑部任务接入内容生产流。
              </p>
            )}
          </div>
        </section>

        <section className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white p-6">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              结构化输入
            </h3>

            <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  标题
                </p>
                <p className="mt-1 text-foreground">{data.structuredInput.title}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  主题
                </p>
                <p className="mt-1 text-foreground">{data.structuredInput.topic}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  关键词
                </p>
                <p className="mt-1 text-foreground">
                  {renderKeywords(data.structuredInput.keywords)}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    内容类型
                  </p>
                  <p className="mt-1 text-foreground">
                    {data.structuredInput.contentType}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">
                    生成目标
                  </p>
                  <p className="mt-1 text-foreground">
                    {data.structuredInput.generationGoal}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  备注
                </p>
                <p className="mt-1 whitespace-pre-wrap text-foreground">
                  {data.structuredInput.notes || "未填写备注"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white p-6">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              生成结果
            </h3>

            <div className="mt-5 space-y-4">
              <div className="rounded-[24px] border border-line bg-surface-soft p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  占位输出预览
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-foreground">
                  {data.formValues.outputText || "当前还没有生成结果，可先执行“生成占位稿”。"}
                </p>
              </div>

              <div className="rounded-[24px] border border-line p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  结构化输出 JSON
                </p>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-muted">
                  {JSON.stringify(data.outputJson, null, 2) || "null"}
                </pre>
              </div>
            </div>
          </section>
        </section>
      </section>
    </div>
  );
}
