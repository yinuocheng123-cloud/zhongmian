/**
 * 文件说明：该文件实现后台词条新建页。
 * 功能说明：承载 Term 的最小真实录入表单，并为数据库不可用场景提供提示。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：新建页实现
 */

import { AdminNotice } from "@/components/admin/admin-notice";
import { TermForm } from "@/components/admin/term-form";
import { emptyTermFormValues } from "@/features/admin/resources/types";

export default function AdminTermNewPage() {
  return (
    <div className="space-y-6">
      {!process.env.DATABASE_URL ? (
        <AdminNotice
          tone="info"
          title="当前为无数据库演示状态"
          description="表单结构和提交流程已经接好，但如果未配置 DATABASE_URL，点击保存时会收到明确错误提示。"
        />
      ) : null}

      <section className="rounded-[28px] border border-line bg-white p-6">
        <div className="mb-6 space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            新建词条
          </h2>
          <p className="text-sm leading-7 text-muted">
            当前优先覆盖词条系统的一期必要字段：名称、Slug、定义、短定义与延伸正文。
          </p>
        </div>
        <TermForm initialValues={emptyTermFormValues} />
      </section>
    </div>
  );
}
