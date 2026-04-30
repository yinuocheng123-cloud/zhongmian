/**
 * 文件说明：该文件实现后台扩展栏目的新建页。
 * 功能说明：基于现有 Content 表单与流转能力，为趋势、事件、品牌进展、榜单、
 * 指数、标准与智库栏目提供锁定频道的新建入口。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：扩展栏目新建页实现
 */

import { notFound } from "next/navigation";
import { AdminNotice } from "@/components/admin/admin-notice";
import { ContentForm } from "@/components/admin/content-form";
import { emptyContentFormValues } from "@/features/admin/resources/types";
import { getContentCreationOptions } from "@/features/admin/resources/server";
import { getManagedChannelBySlug } from "@/lib/site-channels";

type PageProps = {
  params: Promise<{ channel: string }>;
};

export default async function AdminReservedChannelNewPage({
  params,
}: PageProps) {
  const { channel } = await params;
  const config = getManagedChannelBySlug(channel);

  if (!config) {
    notFound();
  }

  const creationResult = await getContentCreationOptions(config.adminNewPath);

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
            新建{config.title}内容
          </h2>
          <p className="text-sm leading-7 text-muted">
            当前页面会锁定到 {config.title} 栏目，继续沿用统一 Content 模型、发布流转和 AI 编辑部挂接能力。
          </p>
        </div>

        <ContentForm
          initialValues={{
            ...emptyContentFormValues,
            channelKey: config.channelKey,
            contentType: config.defaultContentType,
            returnBasePath: config.adminPath,
          }}
          categoryOptions={creationResult.data.categoryOptions}
          tagOptions={creationResult.data.tagOptions}
          brandOptions={creationResult.data.brandOptions}
          lockedChannelKey={config.channelKey}
          returnBasePath={config.adminPath}
        />
      </section>
    </div>
  );
}
