/**
 * 文件说明：该文件实现后台词条新建页。
 * 功能说明：承载 Term 的真实录入表单，并加载词条分类标签选项供运营维护。
 *
 * 结构概览：
 *   第一部分：依赖导入
 *   第二部分：词条新建页实现
 */

import { AdminNotice } from "@/components/admin/admin-notice";
import { TermForm } from "@/components/admin/term-form";
import { getTermTaxonomyOptions } from "@/features/admin/resources/server";
import { emptyTermFormValues } from "@/features/admin/resources/types";

export default async function AdminTermNewPage() {
  const taxonomyResult = await getTermTaxonomyOptions();

  return (
    <div className="space-y-6">
      {!taxonomyResult.databaseReady ? (
        <AdminNotice
          tone="info"
          title="当前为无数据库演示状态"
          description={
            taxonomyResult.error ??
            "表单结构和提交流程已经接好，但如未配置 DATABASE_URL，点击保存时会收到明确错误提示。"
          }
        />
      ) : null}

      <section className="rounded-[28px] border border-line bg-white p-6">
        <div className="mb-6 space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            新建词条
          </h2>
          <p className="text-sm leading-7 text-muted">
            词条系统是中眠网的知识底座，因此从后台就直接按“定义、解释、分类、标签、发布状态”来维护，而不是把词条当成普通文章。
          </p>
        </div>
        <TermForm
          initialValues={emptyTermFormValues}
          categoryOptions={taxonomyResult.data.categoryOptions}
          tagOptions={taxonomyResult.data.tagOptions}
        />
      </section>
    </div>
  );
}
