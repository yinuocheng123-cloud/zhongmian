/**
 * 文件说明：该文件实现后台扩展栏目的编辑页。
 * 功能说明：为趋势、事件、品牌进展、榜单、指数、标准与智库内容提供统一的
 * 编辑、工作流、版本记录、AI 任务入口与安全删除能力。
 *
 * 结构概览：
 *   第一部分：依赖导入与参数工具
 *   第二部分：扩展栏目编辑页实现
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
import { getManagedChannelBySlug } from "@/lib/site-channels";

type Params = Promise<{ channel: string; id: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingleParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminReservedChannelDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { channel, id } = await params;
  const config = getManagedChannelBySlug(channel);

  if (!config) {
    notFound();
  }

  const resolvedSearchParams = searchParams ? await searchParams : {};
  const notice = getSingleParam(resolvedSearchParams, "notice");
  const result = await getContentEditorData(id, `${config.adminPath}/${id}`);

  if (result.databaseReady && !result.data) {
    notFound();
  }

  if (!result.data) {
    return (
      <AdminNotice
        tone="info"
        title={`当前无法读取${config.title}详情`}
        description={result.error ?? "数据库尚未就绪，因此暂时无法进入真实编辑状态。"}
      />
    );
  }

  if (result.data.formValues.channelKey !== config.channelKey) {
    notFound();
  }

  const canDelete =
    result.data.formValues.workflowStatus === "DRAFT" ||
    result.data.formValues.workflowStatus === "OFFLINE";
  const deleteAction = deleteResourceAction.bind(
    null,
    "content",
    id,
    config.adminPath,
  );

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
          title={result.databaseReady ? `${config.title}详情读取失败` : "当前为只读模式"}
          description={result.error}
        />
      ) : null}

      <section className="rounded-[28px] border border-line bg-white p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              编辑{config.title}内容
            </h2>
            <p className="text-sm leading-7 text-muted">
              当前编辑页继续沿用统一 Content 模型、Workflow、ContentVersion 与 AI 任务挂点，确保新增栏目不脱离已有生产底座。
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
          brandOptions={result.data.brandOptions}
          lockedChannelKey={config.channelKey}
          returnBasePath={config.adminPath}
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
                    {item.note ?? "当前没有补充备注。"}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    操作人：{item.actorName ?? "系统"}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-line p-4 text-sm leading-7 text-muted">
                当前还没有工作流记录，保存或切换状态后会自动写入。
              </p>
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
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        V{item.versionNumber}
                      </span>
                      <span className="text-xs text-muted">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {item.changeNote ?? "当前版本未补充变更说明。"}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      创建人：{item.createdBy ?? "系统"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-line p-4 text-sm leading-7 text-muted">
                  当前还没有版本记录，首次保存后会自动生成版本快照。
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white p-6">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              AI 编辑部挂点
            </h3>
            <div className="mt-5 space-y-4">
              {result.data.aiTasks.length > 0 ? (
                result.data.aiTasks.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/ai-editorial/${item.id}`}
                    className="block rounded-2xl border border-line p-4 transition hover:border-brand"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm font-semibold text-foreground">
                        {item.taskType}
                      </span>
                      <span className="text-xs text-muted">
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      最近生成：{formatDateTime(item.finishedAt ?? item.createdAt)}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-line p-4 text-sm leading-7 text-muted">
                  当前还没有关联的 AI 任务。后续可在 AI 编辑部中为该栏目内容创建草稿任务。
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-line bg-white p-6">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              删除与风险控制
            </h3>
            <p className="mt-3 text-sm leading-7 text-muted">
              为避免误删已公开内容，当前仅允许删除草稿或已下线内容。已发布与待审核内容请优先走下线或状态流转。
            </p>
            {canDelete ? (
              <form action={deleteAction} className="mt-5">
                <FormSubmitButton
                  intent="UNPUBLISH"
                  type="submit"
                  tone="danger"
                  label={`删除当前${config.shortTitle}内容`}
                  confirmTitle="确认删除当前内容吗？"
                  confirmDescription="删除后会一并清理工作流与版本记录，当前操作不可撤销。"
                />
              </form>
            ) : (
              <p className="mt-5 rounded-2xl border border-dashed border-line p-4 text-sm leading-7 text-muted">
                当前内容状态为 {workflowStatusLabels[result.data.formValues.workflowStatus ?? "DRAFT"]}，
                为避免误删，暂不允许直接删除。请先下线或转回草稿后再执行删除。
              </p>
            )}
          </section>
        </div>
      </section>
    </div>
  );
}
