/**
 * 文件说明：该文件实现中眠网扩展栏目内容详情页。
 * 功能说明：统一承接行业趋势、行业事件、品牌进展、中眠榜、中眠指数、睡眠标准
 * 与中眠智库详情展示，确保各栏目详情都走真实 Prisma 数据与 PUBLISHED 门禁逻辑。
 *
 * 结构概览：
 *   第一部分：导入依赖与格式化工具
 *   第二部分：metadata 与数据库兜底
 *   第三部分：扩展栏目详情页实现
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/shared/section-heading";
import { StructuredTextContent } from "@/components/shared/structured-text-content";
import { getPublishedChannelContentDetail } from "@/features/site/details/server";
import { buildPageMetadata } from "@/lib/seo";
import { getContentPublicPath, getManagedChannelBySlug } from "@/lib/site-channels";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    channel: string;
    slug: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "待补充";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function DatabaseUnavailableState({
  title,
  message,
}: {
  title: string;
  message?: string;
}) {
  return (
    <div className="portal-shell">
      <section className="portal-card rounded-[32px] border border-line p-8 sm:p-10">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            真实数据未就绪
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            当前无法读取 {title} 详情
          </h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {message ??
              "数据库尚未就绪，因此当前页面不会回退到 demo 数据。连接数据库并发布内容后，此页面会直接展示真实详情。"}
          </p>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { channel, slug } = await params;
  const config = getManagedChannelBySlug(channel);

  if (!config?.channelKey) {
    return buildPageMetadata({
      title: "栏目详情不存在",
      description: "当前栏目详情不存在或尚未开放。",
      path: "/",
      noIndex: true,
    });
  }

  const result = await getPublishedChannelContentDetail(config.channelKey, slug);

  if (!result.databaseReady || !result.data) {
    return buildPageMetadata({
      title: `${config.title}详情 | 中眠网`,
      description: config.description,
      path: config.path,
      noIndex: !result.databaseReady,
      keywords: [...config.seoKeywords],
    });
  }

  const content = result.data;

  return buildPageMetadata({
    title: content.seoTitle ?? `${content.title} | ${config.title} | 中眠网`,
    description:
      content.seoDescription ??
      content.summary ??
      `${config.title}详情页，展示中眠网已发布的栏目内容。`,
    path: `${config.detailPrefix}/${encodeURIComponent(content.slug)}`,
    keywords: [...config.seoKeywords, ...content.tags.map((tag) => tag.name)],
  });
}

export default async function ReservedChannelDetailPage({ params }: PageProps) {
  const { channel, slug } = await params;
  const config = getManagedChannelBySlug(channel);

  if (!config?.channelKey) {
    notFound();
  }

  const result = await getPublishedChannelContentDetail(config.channelKey, slug);

  if (!result.databaseReady) {
    return <DatabaseUnavailableState title={config.title} message={result.error} />;
  }

  if (!result.data) {
    notFound();
  }

  const content = result.data;

  return (
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
            {config.itemEyebrow}
          </span>
          <span className="rounded-full border border-line bg-surface-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {content.contentType}
          </span>
          {content.categories.slice(0, 1).map((category) => (
            <span
              key={category.slug}
              className="rounded-full border border-line bg-surface-soft px-3 py-1 text-xs text-muted"
            >
              {category.name}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {content.title}
            </h1>
            <p className="max-w-3xl text-sm leading-8 text-muted sm:text-base">
              {content.summary ?? "当前内容尚未补充摘要说明。"}
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-muted">
              <span>发布时间：{formatDate(content.publishedAt)}</span>
              <span>更新时间：{formatDate(content.updatedAt)}</span>
              {content.referenceVersion ? (
                <span>版本号：{content.referenceVersion}</span>
              ) : null}
            </div>
          </div>

          <aside className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">页面角色</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
              <p>{config.purpose}</p>
              <p>前台仅渲染已发布内容，草稿、待审核与已下线内容不会进入此详情页。</p>
              {content.eventStartAt || content.eventLocation || content.eventKind ? (
                <>
                  <p>事件时间：{formatDate(content.eventStartAt)}</p>
                  <p>事件地点：{content.eventLocation ?? "待补充"}</p>
                  <p>事件类型：{content.eventKind ?? "待补充"}</p>
                </>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="portal-card rounded-[32px] p-8">
          <SectionHeading
            eyebrow="正文"
            title={`${config.title}正文`}
            description="后台结构化录入的正文会在前台按统一样式展示，避免不同栏目详情格式割裂。"
          />
          <div className="mt-8">
            <StructuredTextContent value={content.body} />
          </div>
        </article>

        <aside className="space-y-6">
          <section className="portal-card rounded-[32px] p-6">
            <p className="text-sm font-semibold text-brand">分类与标签</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {content.categories.map((category) => (
                <span
                  key={category.slug}
                  className="rounded-full border border-line bg-surface-soft px-3 py-1 text-sm text-muted"
                >
                  {category.name}
                </span>
              ))}
              {content.tags.map((tag) => (
                <span
                  key={tag.slug}
                  className="rounded-full border border-line bg-surface-soft px-3 py-1 text-sm text-muted"
                >
                  #{tag.name}
                </span>
              ))}
              {content.categories.length === 0 && content.tags.length === 0 ? (
                <span className="rounded-full border border-dashed border-line px-3 py-1 text-sm text-muted">
                  暂未补充分类与标签
                </span>
              ) : null}
            </div>
          </section>

          {content.relatedBrands.length > 0 ? (
            <section className="portal-card rounded-[32px] p-6">
              <p className="text-sm font-semibold text-brand">关联品牌</p>
              <div className="mt-4 space-y-3">
                {content.relatedBrands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/brands/${encodeURIComponent(brand.slug)}`}
                    className="block rounded-2xl border border-line bg-surface-soft px-4 py-3 text-sm text-foreground transition hover:border-brand hover:text-brand"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="portal-card rounded-[32px] p-6">
            <p className="text-sm font-semibold text-brand">相关内容</p>
            <div className="mt-4 space-y-3">
              {content.relatedContents.length > 0 ? (
                content.relatedContents.map((item) => (
                  <Link
                    key={item.id}
                    href={
                      getContentPublicPath({
                        slug: item.slug,
                        channelKey: item.channelKey,
                      }) ?? `/knowledge/${encodeURIComponent(item.slug)}`
                    }
                    className="block rounded-2xl border border-line bg-surface-soft px-4 py-3 text-sm text-foreground transition hover:border-brand hover:text-brand"
                  >
                    {item.title}
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-7 text-muted">
                  当前还没有与此内容直接关联的已发布栏目内容，后续可在后台继续补充。
                </p>
              )}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
