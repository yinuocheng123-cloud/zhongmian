/**
 * 文件说明：该文件实现后台内容编辑页。
 * 功能说明：展示 Content 的真实编辑表单、工作流记录、版本记录与 AI 任务挂点。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：公共展示辅助
 *   第三部分：编辑页实现
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ContentForm } from "@/components/admin/content-form";
import { ResourceStatusBadge } from "@/components/admin/resource-status-badge";
import {
  workflowStatusLabels,
} from "@/features/admin/resources/constants";
import { getContentEditorData } from "@/features/admin/resources/server";
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

export default async function AdminContentDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const notice = getSingleParam(resolvedSearchParams, "notice");
  const result = await getContentEditorData(id);

  if (result.databaseReady && !result.data) {
    notFound();
  }

  if (!result.data) {
    return (
      <AdminNotice
        tone="info"
        title="当前无法读取内容详情"
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
          description={`当前内容已完成：${notice}`}
        />
      ) : null}

      {result.error ? (
        <AdminNotice
          tone={result.databaseReady ? "error" : "info"}
          title={result.databaseReady ? "内容详情读取失败" : "当前为只读模式"}
          description={result.error}
        />
      ) : null}

      <section className="rounded-[28px] border border-line bg-white p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              编辑内容
            </h2>
            <p className="text-sm leading-7 text-muted">
              保存会写入 ContentVersion，状态切换会写入 Workflow。这样后续接 AI 编辑部和版本回查时，不需要再改主流程。
            </p>
          </div>
          {result.data.formValues.workflowStatus ? (
            <ResourceStatusBadge status={result.data.formValues.workflowStatus} />
          ) : null}
        </div>
        <ContentForm initialValues={result.data.formValues} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-line bg-white p-6">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            工作流记录
          </h3>
          <div className="mt-5 space-y-4">
            {result.data.workflowHistory.length > 0 ? (
              result.data.workflowHistory.map((item) => (
                <div key={item.id} className="rounded-2xl border border-line p-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-semibold text-foreground">
                      {item.fromStatus
                        ? `${workflowStatusLabels[item.fromStatus]} → ${workflowStatusLabels[item.toStatus]}`
                        : `初始化为 ${workflowStatusLabels[item.toStatus]}`}
                    </span>
                    <span className="text-xs text-muted">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-muted">
                    {item.note ?? "未填写操作备注。"}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    操作者：{item.actorName ?? "未记录"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">当前还没有工作流记录。</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[28px] border border-line bg-white p-6">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              内容版本
            </h3>
            <div className="mt-5 space-y-4">
              {result.data.versions.length > 0 ? (
                result.data.versions.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-line p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        V{item.versionNumber}
                      </span>
                      <span className="text-xs text-muted">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {item.changeNote ?? "未填写变更说明。"}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      记录人：{item.createdBy ?? "未记录"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">当前还没有版本记录。</p>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white p-6">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              AI 任务挂点
            </h3>
            <div className="mt-5 space-y-4">
              {result.data.aiTasks.length > 0 ? (
                result.data.aiTasks.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-line p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Link
                        href={`/admin/ai-editorial/${item.id}`}
                        className="text-sm font-semibold text-foreground transition hover:text-brand"
                      >
                        {item.taskType}
                      </Link>
                      <span className="text-xs text-muted">{item.status}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      模型：{item.modelName ?? "未记录"}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      创建于：{formatDateTime(item.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted">
                  当前还未接入真实 AI 编辑部，但 AiTask 挂点已经可承接后续流程。
                </p>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
