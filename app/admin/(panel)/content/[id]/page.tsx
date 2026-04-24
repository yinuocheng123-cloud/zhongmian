/**
 * 文件说明：该文件实现后台内容编辑页。
 * 功能说明：展示 Content 的真实编辑表单、工作流记录、版本记录、AI 任务挂点与前台查看入口。
 *
 * 结构概览：
 *   第一部分：依赖导入与查询参数工具
 *   第二部分：内容编辑页实现
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ContentForm } from "@/components/admin/content-form";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { ResourceStatusBadge } from "@/components/admin/resource-status-badge";
import { deleteResourceAction } from "@/features/admin/resources/actions";
import { workflowStatusLabels } from "@/features/admin/resources/constants";
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

  const canDelete =
    result.data.formValues.workflowStatus === "DRAFT" ||
    result.data.formValues.workflowStatus === "OFFLINE";
  const deleteAction = deleteResourceAction.bind(null, "content", id, "/admin/content");

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
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              编辑内容
            </h2>
            <p className="text-sm leading-7 text-muted">
              保存会写入 ContentVersion，状态切换会写入 Workflow。当前编辑页同时承接分类标签、发布时间和前台查看入口。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {result.data.formValues.workflowStatus ? (
              <ResourceStatusBadge status={result.data.formValues.workflowStatus} />
            ) : null}
            {result.data.publicPath ? (
              <Link
                href={result.data.publicPath}
                target="_blank"
                className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-medium text-foreground transition hover:border-brand hover:text-brand"
              >
                前台查看
              </Link>
            ) : (
              <span className="inline-flex rounded-2xl border border-dashed border-line px-4 py-2 text-sm text-muted">
                未发布，前台不可见
              </span>
            )}
          </div>
        </div>

        <ContentForm
          initialValues={result.data.formValues}
          categoryOptions={result.data.categoryOptions}
          tagOptions={result.data.tagOptions}
        />
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
              版本记录
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
                      Provider：{item.modelName ?? "未记录"}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      创建于：{formatDateTime(item.createdAt)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted">
                  当前还没有挂接的 AI 任务，可从 AI 编辑部创建选题并回挂到此内容草稿。
                </p>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="rounded-[28px] border border-rose-200 bg-rose-50/60 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              删除内容
            </h3>
            <p className="text-sm leading-7 text-muted">
              仅允许删除草稿或已下线内容。删除后将同步清理该内容的工作流、版本记录和 AI 挂接记录，前台也不会再保留访问入口。
            </p>
          </div>

          {canDelete ? (
            <form action={deleteAction}>
              <FormSubmitButton
                intent="DELETE"
                label="删除内容"
                pendingLabel="正在删除..."
                tone="danger"
                confirmTitle="确认删除这条内容吗？"
                confirmDescription="删除后无法恢复，相关草稿、版本记录和流程记录会一并清理。"
              />
            </form>
          ) : (
            <span className="inline-flex rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-700">
              已发布或待审核内容不能直接删除，请先下线或转回草稿。
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
