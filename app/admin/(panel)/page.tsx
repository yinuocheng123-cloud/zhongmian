/**
 * 文件说明：该文件实现中眠网后台运营仪表盘。
 * 功能说明：展示内容、词条、品牌、AI 编辑部与上线状态的运营概览，帮助运营进入后台后快速判断处理优先级。
 *
 * 结构概览：
 *   第一部分：依赖导入
 *   第二部分：仪表盘页面实现
 */

import Link from "next/link";
import { AdminNotice } from "@/components/admin/admin-notice";
import { AiTaskStatusBadge } from "@/components/admin/ai-task-status-badge";
import { ResourceStatusBadge } from "@/components/admin/resource-status-badge";
import { getAdminDashboardData } from "@/features/admin/resources/server";
import { contentTypeOptions } from "@/features/admin/resources/constants";
import { formatDateTime } from "@/features/admin/resources/utils";

export default async function AdminDashboardPage() {
  const result = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      {result.error ? (
        <AdminNotice
          tone={result.databaseReady ? "error" : "info"}
          title={result.databaseReady ? "后台概览读取失败" : "后台概览当前为只读模式"}
          description={result.error}
        />
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {result.data.overviewCards.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-line bg-surface-soft p-5"
          >
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {item.value}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_1.15fr_0.9fr]">
        {[
          {
            title: "内容状态概览",
            rows: result.data.contentStatusCounts,
            href: "/admin/content",
          },
          {
            title: "词条状态概览",
            rows: result.data.termStatusCounts,
            href: "/admin/terms",
          },
          {
            title: "品牌状态概览",
            rows: result.data.brandStatusCounts,
            href: "/admin/brands",
          },
        ].map((section) => (
          <div
            key={section.title}
            className="rounded-[28px] border border-line bg-white p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-serif text-xl font-semibold text-foreground">
                {section.title}
              </h2>
              <Link
                href={section.href}
                className="text-sm font-medium text-brand transition hover:text-brand-strong"
              >
                进入管理
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {section.rows.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between rounded-2xl border border-line px-4 py-3"
                >
                  <span className="text-sm text-foreground">{item.label}</span>
                  <span className="text-sm font-semibold text-foreground">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[28px] border border-line bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              最近新建 / 更新内容
            </h2>
            <Link
              href="/admin/content"
              className="text-sm font-medium text-brand transition hover:text-brand-strong"
            >
              查看全部内容
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {result.data.recentContents.length > 0 ? (
              result.data.recentContents.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-line px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/content/${item.id}`}
                        className="block truncate font-medium text-foreground transition hover:text-brand"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted">
                        {contentTypeOptions.find((option) => option.value === item.contentType)
                          ?.label ?? item.contentType}
                        {" · "}
                        {formatDateTime(item.updatedAt)}
                      </p>
                    </div>
                    <ResourceStatusBadge status={item.workflowStatus} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">当前还没有可展示的内容记录。</p>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-line bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              最近 AI 任务
            </h2>
            <Link
              href="/admin/ai-editorial"
              className="text-sm font-medium text-brand transition hover:text-brand-strong"
            >
              进入 AI 编辑部
            </Link>
          </div>

          <div className="mt-5 space-y-4">
            {result.data.recentAiTasks.length > 0 ? (
              result.data.recentAiTasks.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-line px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/ai-editorial/${item.id}`}
                        className="block truncate font-medium text-foreground transition hover:text-brand"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-xs text-muted">
                        {item.taskType}
                        {" · "}
                        {item.providerId ?? "未记录 Provider"}
                        {" · "}
                        {formatDateTime(item.updatedAt)}
                      </p>
                      {item.contentId ? (
                        <Link
                          href={`/admin/content/${item.contentId}`}
                          className="mt-2 inline-flex text-xs font-medium text-brand transition hover:text-brand-strong"
                        >
                          进入挂接的 Content 草稿
                        </Link>
                      ) : null}
                    </div>
                    <AiTaskStatusBadge status={item.status} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted">当前还没有 AI 任务记录。</p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-line bg-surface-soft p-6">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          首批内容上线状态概览
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-line bg-white px-4 py-4">
            <p className="text-sm text-muted">已发布内容</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {result.data.launchOverview.publishedContentCount}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white px-4 py-4">
            <p className="text-sm text-muted">已发布词条</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {result.data.launchOverview.publishedTermCount}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white px-4 py-4">
            <p className="text-sm text-muted">已发布品牌</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {result.data.launchOverview.publishedBrandCount}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white px-4 py-4">
            <p className="text-sm text-muted">待审核总量</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {result.data.launchOverview.pendingReviewCount}
            </p>
          </div>
          <div className="rounded-2xl border border-line bg-white px-4 py-4">
            <p className="text-sm text-muted">疑似测试残留</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {result.data.launchOverview.suspiciousPublishedCount}
            </p>
            <p className="mt-2 text-xs leading-6 text-muted">
              {result.data.launchOverview.suspiciousPublishedCount > 0
                ? "建议优先处理，避免误暴露。"
                : "当前未发现已发布测试残留。"}
            </p>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-muted">
          仪表盘优先回答四个问题：站点上了多少内容、哪些还在待审核、AI 编辑部最近在做什么、当前首批上线内容是否已经达到稳定公开状态。
        </p>
      </section>
    </div>
  );
}
