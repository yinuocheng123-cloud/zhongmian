/**
 * 文件说明：该文件实现中眠网前台的品牌详情页。
 * 功能说明：根据 slug 读取已发布的 Brand 数据，并以企业名片 + 行业名录的方式进行展示。
 *
 * 结构概览：
 *   第一部分：元数据与辅助函数
 *   第二部分：数据库不可用兜底
 *   第三部分：品牌详情、企业信息与关联内容展示
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/shared/section-heading";
import { StructuredTextContent } from "@/components/shared/structured-text-content";
import { getPublishedBrandDetail } from "@/features/site/details/server";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(date: Date) {
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
            品牌数据未就绪
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            当前无法读取真实品牌详情数据
          </h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {message ??
              "数据库尚未就绪，因此品牌页不会回退到 demo 数据。连接数据库并导入种子数据后，这里会直接读取后台已发布品牌。"}
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
  const result = await getPublishedBrandDetail(slug);

  if (!result.databaseReady || !result.data) {
    return {
      title: "睡眠品牌详情 | 中眠网",
      description: "中眠网前台睡眠品牌详情页。",
    };
  }

  const brand = result.data;

  return {
    title: brand.seoTitle ?? `${brand.name} | 中眠网品牌库`,
    description:
      brand.seoDescription ??
      brand.summary ??
      "中眠网前台睡眠品牌详情页。",
  };
}

export default async function BrandDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublishedBrandDetail(slug);

  if (!result.databaseReady) {
    return <DatabaseUnavailableState message={result.error} />;
  }

  if (!result.data) {
    notFound();
  }

  const brand = result.data;

  return (
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                已发布品牌
              </span>
              <span className="rounded-full border border-line bg-surface-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                行业名录
              </span>
            </div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {brand.name}
            </h1>
            <p className="max-w-3xl text-sm leading-8 text-muted sm:text-base">
              {brand.summary ?? "当前品牌尚未补充简介。"}
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-muted">
              <span>更新时间：{formatDate(brand.updatedAt)}</span>
              <span>角色：品牌展示 / 信任参考 / 合作入口</span>
            </div>
          </div>

          <aside className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">企业信息摘要</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
              <p>主营方向：{brand.tagline ?? brand.summary ?? "待补充"}</p>
              <p>地区：{brand.region ?? "待补充"}</p>
              <p>城市：{brand.city ?? "待补充"}</p>
              <p>
                官网：
                {brand.website ? (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-1 text-brand underline-offset-4 hover:underline"
                  >
                    {brand.website}
                  </a>
                ) : (
                  "待补充"
                )}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="portal-grid lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="space-y-6">
          <section className="portal-card rounded-[28px] p-7">
            <SectionHeading
              eyebrow="名录结构"
              title="品牌分类与地区"
              description="品牌页优先强调行业名录结构，而不是文章式叙述。"
            />
            <div className="mt-6 space-y-4 text-sm text-muted">
              <div className="space-y-3">
                <p className="font-semibold text-foreground">分类</p>
                <div className="flex flex-wrap gap-2">
                  {brand.categories.length > 0 ? (
                    brand.categories.map((category) => (
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
                  {brand.tags.length > 0 ? (
                    brand.tags.map((tag) => (
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
              eyebrow="相关品牌"
              title="同区域 / 同分类参考"
              description="这里先验证品牌独立模型是否能支撑行业参考入口。"
            />
            <div className="mt-6 space-y-3">
              {brand.relatedBrands.length > 0 ? (
                brand.relatedBrands.map((item) => (
                  <Link
                    key={item.id}
                    href={`/brands/${item.slug}`}
                    className="block rounded-3xl border border-line bg-surface-soft p-4 transition hover:border-brand"
                  >
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="mt-2 text-sm text-muted">
                      {item.region ?? "待补充地区"}
                      {item.city ? ` / ${item.city}` : ""}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-line bg-surface-soft p-4 text-sm leading-7 text-muted">
                  当前还没有可直接展示的同类品牌，后续可以继续补充行业名录与品牌关系数据。
                </div>
              )}
            </div>
          </section>
        </aside>

        <article className="portal-card rounded-[32px] p-8">
          <SectionHeading
            eyebrow="品牌介绍"
            title="企业简介与详细介绍"
            description="这一部分验证 Brand 独立模型已经可以直接支撑前台的品牌名片与信任展示。"
          />
          <div className="mt-8 space-y-6">
            <div className="rounded-[28px] border border-line bg-surface-soft p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                主营方向
              </p>
              <p className="mt-4 text-sm leading-8 text-foreground/86 sm:text-base">
                {brand.tagline ?? brand.summary ?? "当前品牌尚未补充主营方向。"}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                详细介绍
              </h2>
              <StructuredTextContent
                value={brand.description}
                emptyText="当前品牌尚未补充详细介绍，后续可以继续补充产品方向、服务能力、行业合作与标准关联信息。"
                className="space-y-4"
              />
            </div>
          </div>
        </article>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="相关内容"
          title="与品牌相关的知识入口"
          description="这一层验证品牌模型与统一内容底座之间的关联已经可以前台展示。"
        />
        <div className="mt-8 portal-grid lg:grid-cols-3">
          {brand.relatedContents.length > 0 ? (
            brand.relatedContents.map((content) => (
              <Link
                key={content.id}
                href={`/knowledge/${content.slug}`}
                className="rounded-[28px] border border-line bg-surface-soft p-6 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                  相关知识
                </p>
                <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">
                  {content.title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {content.summary ?? "当前内容尚未补充摘要。"}
                </p>
              </Link>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-line bg-surface-soft p-6 text-sm leading-7 text-muted lg:col-span-3">
              当前还没有与该品牌直接关联的公开内容，后续可以继续把品牌与专题、知识内容建立更紧的连接。
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
