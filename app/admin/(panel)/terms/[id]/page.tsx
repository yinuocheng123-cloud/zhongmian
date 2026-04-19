/**
 * 文件说明：该文件实现后台词条编辑页。
 * 功能说明：展示 Term 的真实编辑表单、工作流记录与前台查看入口，服务词条系统长期运营。
 *
 * 结构概览：
 *   第一部分：依赖导入与查询参数工具
 *   第二部分：词条编辑页实现
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ResourceStatusBadge } from "@/components/admin/resource-status-badge";
import { TermForm } from "@/components/admin/term-form";
import { workflowStatusLabels } from "@/features/admin/resources/constants";
import { getTermEditorData } from "@/features/admin/resources/server";
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

export default async function AdminTermDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const notice = getSingleParam(resolvedSearchParams, "notice");
  const result = await getTermEditorData(id);

  if (result.databaseReady && !result.data) {
    notFound();
  }

  if (!result.data) {
    return (
      <AdminNotice
        tone="info"
        title="当前无法读取词条详情"
        description={result.error ?? "数据库尚未就绪，因此暂时无法进入真实编辑状态。"}
      />
    );
  }

  return (
    <div className="space-y-6">
      {notice ? (
        <AdminNotice tone="success" title="操作成功" description={notice} />
      ) : null}

      {result.error ? (
        <AdminNotice
          tone={result.databaseReady ? "error" : "info"}
          title={result.databaseReady ? "词条详情读取失败" : "当前为只读模式"}
          description={result.error}
        />
      ) : null}

      <section className="rounded-[28px] border border-line bg-white p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              编辑词条
            </h2>
            <p className="text-sm leading-7 text-muted">
              词条后台优先服务“定义、解释、分类、状态、前台查看”五件事，保证词条系统真正承担知识底座角色。
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

        <TermForm
          initialValues={result.data.formValues}
          categoryOptions={result.data.categoryOptions}
          tagOptions={result.data.tagOptions}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[28px] border border-line bg-white p-6">
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
        </section>

        <section className="rounded-[28px] border border-line bg-white p-6">
          <h3 className="font-serif text-xl font-semibold text-foreground">
            词条运营提示
          </h3>
          <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
            <p>短定义用于列表卡片和首页精选，建议控制在 1 到 2 句话。</p>
            <p>详细解释用于承接“概念、节点、关联”结构，是词条页区别于文章页的关键。</p>
            <p>分类决定词条挂在机制、障碍、指标还是产品维度；标签决定与问题和品牌的跨栏目连接。</p>
            <p>相关词条当前先通过标签和分类做预留，后续需要时再升级成显式关系表。</p>
          </div>
        </section>
      </section>
    </div>
  );
}
