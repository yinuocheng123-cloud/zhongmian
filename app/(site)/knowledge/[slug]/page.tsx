/**
 * 文件说明：该文件实现中眠网前台的知识内容详情页。
 * 功能说明：根据 slug 读取已发布的 Content 数据，并展示标题、摘要、正文、分类标签与关联入口。
 *
 * 结构概览：
 *   第一部分：元数据与公共格式化函数
 *   第二部分：数据库不可用兜底
 *   第三部分：知识内容详情展示
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/shared/section-heading";
import { StructuredTextContent } from "@/components/shared/structured-text-content";
import { getPublishedContentDetail } from "@/features/site/details/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(date: Date | null) {
  if (!date) {
    return "待发布";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function DatabaseUnavailableState({ message }: { message?: string }) {
  return (
    <div className="portal-shell">
      <section className="portal-card rounded-[32px] border border-line p-8 sm:p-10">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            真实数据未就绪
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            当前无法读取前台知识详情数据
          </h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {message ??
              "数据库尚未就绪，因此当前页面不会回退到 demo 数据。连接数据库并导入种子数据后，此页面会直接展示后台已发布内容。"}
          </p>
        </div>
      </section>
    </div>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublishedContentDetail(slug);

  if (!result.databaseReady || !result.data) {
    return {
      title: "睡眠知识详情 | 中眠网",
      description: "中眠网前台睡眠知识详情页。",
    };
  }

  const content = result.data;

  return {
    title: content.seoTitle ?? `${content.title} | 中眠网`,
    description:
      content.seoDescription ??
      content.summary ??
      "中眠网前台睡眠知识详情页。",
  };
}

export default async function KnowledgeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublishedContentDetail(slug);

  if (!result.databaseReady) {
    return <DatabaseUnavailableState message={result.error} />;
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
            统一内容底座
          </span>
          <span className="rounded-full border border-line bg-surface-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
            {content.contentType}
          </span>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {content.title}
            </h1>
            <p className="max-w-3xl text-sm leading-8 text-muted sm:text-base">
              {content.summary ?? "当前内容尚未补充摘要。"}
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-muted">
              <span>发布时间：{formatDate(content.publishedAt)}</span>
              <span>更新时间：{formatDate(content.updatedAt)}</span>
            </div>
          </div>

          <aside className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">页面角色</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
              <p>该页验证统一 Content 模型已经可以直接支撑中眠网前台知识内容展示。</p>
              <p>前台只渲染已发布内容，未发布或已下线状态不会暴露到公开页面。</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="portal-grid lg:grid-cols-[1.15fr_0.85fr]">
        <article className="portal-card rounded-[32px] p-8">
          <SectionHeading
            eyebrow="正文"
            title="睡眠知识正文"
            description="这一部分验证后台录入的正文内容已经可以在前台真实渲染。"
          />
          <div className="mt-8">
            <StructuredTextContent
              value={content.body}
              emptyText="当前内容尚未补充正文，可继续通过后台编辑器完善内容结构与详细说明。"
            />
          </div>
        </article>

        <aside className="space-y-6">
          <section className="portal-card rounded-[28px] p-7">
            <SectionHeading
              eyebrow="分类与标签"
              title="当前内容归属"
              description="如后台已补充分类与标签，这里会直接读取真实关系数据。"
            />
            <div className="mt-6 space-y-4 text-sm text-muted">
              <div className="space-y-3">
                <p className="font-semibold text-foreground">分类</p>
                <div className="flex flex-wrap gap-2">
                  {content.categories.length > 0 ? (
                    content.categories.map((category) => (
                      <span
                        key={category.slug}
                        className="rounded-full border border-line bg-surface-soft px-3 py-1"
                      >
                        {category.name}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-dashed border-line px-3 py-1">
                      暂未补充分类
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-foreground">标签</p>
                <div className="flex flex-wrap gap-2">
                  {content.tags.length > 0 ? (
                    content.tags.map((tag) => (
                      <span
                        key={tag.slug}
                        className="rounded-full border border-line bg-surface-soft px-3 py-1"
                      >
                        #{tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-dashed border-line px-3 py-1">
                      暂未补充标签
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="portal-card rounded-[28px] p-7">
            <SectionHeading
              eyebrow="延伸入口"
              title="关联词条与品牌"
              description="这里不是普通推荐位，而是知识底座向词条系统和品牌系统延伸的入口。"
            />
            <div className="mt-6 space-y-4 text-sm text-muted">
              <div className="space-y-3">
                <p className="font-semibold text-foreground">相关词条</p>
                <div className="flex flex-wrap gap-2">
                  {content.relatedTerms.length > 0 ? (
                    content.relatedTerms.map((term) => (
                      <Link
                        key={term.id}
                        href={`/terms/${term.slug}`}
                        className="rounded-full border border-line bg-surface-soft px-3 py-1 transition hover:border-brand hover:text-brand"
                      >
                        {term.name}
                      </Link>
                    ))
                  ) : (
                    <span className="rounded-full border border-dashed border-line px-3 py-1">
                      暂无关联词条
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="font-semibold text-foreground">相关品牌</p>
                <div className="flex flex-wrap gap-2">
                  {content.relatedBrands.length > 0 ? (
                    content.relatedBrands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/brands/${brand.slug}`}
                        className="rounded-full border border-line bg-surface-soft px-3 py-1 transition hover:border-brand hover:text-brand"
                      >
                        {brand.name}
                      </Link>
                    ))
                  ) : (
                    <span className="rounded-full border border-dashed border-line px-3 py-1">
                      暂无关联品牌
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="相关推荐"
          title="从同一知识主题继续延伸"
          description="这一层目前先验证真实关系推荐位是否打通，后续再继续细化专题推荐算法。"
        />
        <div className="mt-8 portal-grid lg:grid-cols-3">
          {content.relatedContents.length > 0 ? (
            content.relatedContents.map((item) => (
              <Link
                key={item.id}
                href={`/knowledge/${item.slug}`}
                className="rounded-[28px] border border-line bg-surface-soft p-6 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  已发布内容
                </p>
                <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">
                  {item.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {item.summary ?? "当前内容尚未补充摘要。"}
                </p>
                <p className="mt-4 text-sm text-muted">
                  发布时间：{formatDate(item.publishedAt)}
                </p>
              </Link>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-line bg-surface-soft p-6 text-sm leading-7 text-muted lg:col-span-3">
              当前还没有可直接推荐的相关内容，后续可以继续接入同分类、同标签或同专题的真实相关推荐逻辑。
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
