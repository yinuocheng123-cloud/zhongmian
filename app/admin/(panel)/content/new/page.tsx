/**
 * 文件说明：该文件实现后台内容新建页。
 * 功能说明：承载 Content 的真实录入表单，并加载分类标签选项供运营直接维护。
 *
 * 结构概览：
 *   第一部分：依赖导入
 *   第二部分：内容新建页实现
 */

import { AdminNotice } from "@/components/admin/admin-notice";
import { ContentForm } from "@/components/admin/content-form";
import { emptyContentFormValues } from "@/features/admin/resources/types";
import { getContentCreationOptions } from "@/features/admin/resources/server";

export default async function AdminContentNewPage() {
  const creationResult = await getContentCreationOptions();

  return (
    <div className="space-y-6">
      {!creationResult.databaseReady ? (
        <AdminNotice
          tone="info"
          title="当前为无数据库演示状态"
          description={
            creationResult.error ??
            "表单结构和提交流程已经接好，但如未配置 DATABASE_URL，点击保存时会收到明确错误提示。"
          }
        />
      ) : null}

      <section className="rounded-[28px] border border-line bg-white p-6">
        <div className="mb-6 space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            新建内容
          </h2>
          <p className="text-sm leading-7 text-muted">
            当前内容后台用于统一承接知识内容、行业趋势、专题和后续更多栏目形态，因此从一期开始就直接支持分类、标签、发布时间和发布流转。
          </p>
        </div>
        <ContentForm
          initialValues={emptyContentFormValues}
          categoryOptions={creationResult.data.categoryOptions}
          tagOptions={creationResult.data.tagOptions}
          brandOptions={creationResult.data.brandOptions}
        />
      </section>
    </div>
  );
}
