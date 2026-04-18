/**
 * 文件说明：该文件实现 AI 编辑部任务新建页。
 * 功能说明：承载选题类任务和占位生成任务的最小真实录入表单，并在数据库未就绪时给出明确提示。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：新建页实现
 */

import { AdminNotice } from "@/components/admin/admin-notice";
import { AiTaskForm } from "@/components/admin/ai-task-form";
import {
  emptyAiTaskFormValues,
} from "@/features/admin/editorial/types";
import { getAiTaskCreationOptions } from "@/features/admin/editorial/server";

export default async function AdminAiEditorialNewPage() {
  const result = await getAiTaskCreationOptions();

  return (
    <div className="space-y-6">
      {!result.databaseReady ? (
        <AdminNotice
          tone="info"
          title="当前为无数据库演示状态"
          description={
            result.error ??
            "表单结构和任务流已经接好，但如果未配置 DATABASE_URL，点击保存时会收到明确错误提示。"
          }
        />
      ) : null}

      <section className="rounded-[28px] border border-line bg-white p-6">
        <div className="mb-6 space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            新建 AI 编辑部任务
          </h2>
          <p className="text-sm leading-7 text-muted">
            当前优先支持“选题、占位稿生成和 Content 草稿挂接”的最小闭环，不接真实模型，先把编辑部任务接入内容生产流程。
          </p>
        </div>
        <AiTaskForm
          initialValues={emptyAiTaskFormValues}
          contentOptions={result.data}
        />
      </section>
    </div>
  );
}
