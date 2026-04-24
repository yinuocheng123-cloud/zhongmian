/**
 * 文件说明：该文件实现后台品牌编辑页。
 * 功能说明：展示 Brand 的真实编辑表单、工作流记录与前台查看入口，服务品牌库的长期收录与运营。
 *
 * 结构概览：
 *   第一部分：依赖导入与查询参数工具
 *   第二部分：品牌编辑页实现
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { BrandForm } from "@/components/admin/brand-form";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { ResourceStatusBadge } from "@/components/admin/resource-status-badge";
import { deleteResourceAction } from "@/features/admin/resources/actions";
import { workflowStatusLabels } from "@/features/admin/resources/constants";
import { getBrandEditorData } from "@/features/admin/resources/server";
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

export default async function AdminBrandDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const notice = getSingleParam(resolvedSearchParams, "notice");
  const result = await getBrandEditorData(id);

  if (result.databaseReady && !result.data) {
    notFound();
  }

  if (!result.data) {
    return (
      <AdminNotice
        tone="info"
        title="当前无法读取品牌详情"
        description={result.error ?? "数据库尚未就绪，因此暂时无法进入真实编辑状态。"}
      />
    );
  }

  const canDelete =
    result.data.formValues.workflowStatus === "DRAFT" ||
    result.data.formValues.workflowStatus === "OFFLINE";
  const deleteAction = deleteResourceAction.bind(null, "brand", id, "/admin/brands");

  return (
    <div className="space-y-6">
      {notice ? (
        <AdminNotice tone="success" title="操作成功" description={notice} />
      ) : null}

      {result.error ? (
        <AdminNotice
          tone={result.databaseReady ? "error" : "info"}
          title={result.databaseReady ? "品牌详情读取失败" : "当前为只读模式"}
          description={result.error}
        />
      ) : null}

      <section className="rounded-[28px] border border-line bg-white p-6">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-semibold text-foreground">
              编辑品牌
            </h2>
            <p className="text-sm leading-7 text-muted">
              品牌后台当前优先解决品牌收录、方向表达、区域归类、前台展示和发布控制，后续再承接会员与合作流程。
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

        <BrandForm
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
            品牌运营提示
          </h3>
          <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
            <p>主营方向用于在品牌列表和企业名片卡片上直接表达品牌定位。</p>
            <p>地区与城市决定品牌库的行业名录感，也是后续本地化合作筛选的基础。</p>
            <p>分类体现品牌归属赛道，标签则服务问题入口、专题入口和合作聚合。</p>
            <p>只有 PUBLISHED 的品牌才会在前台品牌库和品牌详情页公开可见。</p>
          </div>
        </section>
      </section>

      <section className="rounded-[28px] border border-rose-200 bg-rose-50/60 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h3 className="font-serif text-xl font-semibold text-foreground">
              删除品牌
            </h3>
            <p className="text-sm leading-7 text-muted">
              仅允许删除草稿或已下线品牌。删除后会同步清理该品牌的流程记录和 AI 挂接，避免测试稿或重复收录长期残留。
            </p>
          </div>

          {canDelete ? (
            <form action={deleteAction}>
              <FormSubmitButton
                intent="DELETE"
                label="删除品牌"
                pendingLabel="正在删除..."
                tone="danger"
                confirmTitle="确认删除这个品牌吗？"
                confirmDescription="删除后无法恢复，相关流程记录和 AI 挂接会一并清理。"
              />
            </form>
          ) : (
            <span className="inline-flex rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm text-rose-700">
              已发布或待审核品牌不能直接删除，请先下线或转回草稿。
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
