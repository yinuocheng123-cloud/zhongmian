/**
 * 文件说明：该文件实现后台品牌新建页。
 * 功能说明：承载 Brand 的真实录入表单，并加载品牌分类标签选项供运营维护。
 *
 * 结构概览：
 *   第一部分：依赖导入
 *   第二部分：品牌新建页实现
 */

import { AdminNotice } from "@/components/admin/admin-notice";
import { BrandForm } from "@/components/admin/brand-form";
import { getBrandTaxonomyOptions } from "@/features/admin/resources/server";
import { emptyBrandFormValues } from "@/features/admin/resources/types";

export default async function AdminBrandNewPage() {
  const taxonomyResult = await getBrandTaxonomyOptions();

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
            新建品牌
          </h2>
          <p className="text-sm leading-7 text-muted">
            品牌后台当前优先服务品牌收录、目录展示和商业入口承接，所以从一期开始就直接支持主营方向、地区、分类、标签和发布状态。
          </p>
        </div>
        <BrandForm
          initialValues={emptyBrandFormValues}
          categoryOptions={taxonomyResult.data.categoryOptions}
          tagOptions={taxonomyResult.data.tagOptions}
        />
      </section>
    </div>
  );
}
