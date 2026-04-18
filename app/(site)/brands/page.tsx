/**
 * 文件说明：该文件实现中眠网前台“睡眠品牌”栏目页的真实列表页。
 * 功能说明：读取已发布品牌数据，并以行业名录和信任展示的方式组织前台品牌入口。
 *
 * 结构概览：
 *   第一部分：元数据与辅助函数
 *   第二部分：数据库不可用与空态兜底
 *   第三部分：品牌目录页面实现
 */

import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublishedBrandsList } from "@/features/site/lists/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "睡眠品牌 | 中眠网",
  description: "查看中眠网已发布的睡眠品牌、企业与机构名录。",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
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
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            品牌列表未就绪
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            当前无法读取真实睡眠品牌名录
          </h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {message ??
              "数据库尚未就绪，因此当前栏目页不会回退到 demo 数据。连接数据库后，这里会直接展示后台已发布品牌。"}
          </p>
        </div>
      </section>
    </div>
  );
}

function SearchForm({ query }: { query: string }) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" action="/brands">
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="搜索品牌名、主营方向、地区或城市"
        className="h-12 flex-1 rounded-full border border-line bg-white px-5 text-sm text-foreground outline-none transition focus:border-brand"
      />
      <button
        type="submit"
        className="h-12 rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-strong"
      >
        搜索品牌目录
      </button>
    </form>
  );
}

export default async function BrandsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const result = await getPublishedBrandsList({ q, take: 9 });

  if (!result.databaseReady) {
    return <DatabaseUnavailableState message={result.error} />;
  }

  const { items, categories, query, limit } = result.data;

  return (
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionHeading
            eyebrow="行业名录 + 信任展示"
            title="从已发布品牌名录进入中眠网的品牌与产业入口"
            description="品牌栏目页不再使用 demo 卡片作为主数据源，而是直接读取已发布 Brand 数据。这里优先承接行业名录、信任展示和未来合作入口。"
          />
          <div className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">品牌搜索</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              当前已接入最小可用搜索，可按品牌名、简介、主营方向、地区和城市检索已发布品牌。
            </p>
            <div className="mt-5">
              <SearchForm query={query} />
            </div>
            <p className="mt-4 text-sm text-muted">当前目录最多展示 {limit} 个公开品牌。</p>
          </div>
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="品牌分类"
          title="先看品牌名录的结构"
          description="这一层读取真实品牌分类及已发布数量，帮助品牌页继续保持行业名录和信任体系的结构感。"
        />
        <div className="mt-8 flex flex-wrap gap-3">
          {categories.length > 0 ? (
            categories.map((category) => (
              <span
                key={category.id}
                className="rounded-full border border-line bg-surface-soft px-4 py-2 text-sm text-foreground/82"
              >
                {category.name} · {category.count}
              </span>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-line bg-surface-soft p-6 text-sm leading-7 text-muted">
              当前还没有可公开展示的品牌分类，等后台发布首批品牌后，这里会形成真实的行业名录结构。
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="已发布品牌名录"
          title={query ? `与“${query}”相关的品牌目录` : "当前可公开访问的睡眠品牌名录"}
          description="列表页只消费已发布 Brand 数据。每张卡片都按企业名片和行业参考结构组织，而不是内容文章卡片。"
        />

        {items.length > 0 ? (
          <div className="portal-grid lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/brands/${item.slug}`}
                className="portal-card rounded-[28px] p-7 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                    已收录
                  </span>
                  <span className="text-sm text-muted">更新于 {formatDate(item.updatedAt)}</span>
                </div>

                <h2 className="mt-5 font-serif text-2xl font-semibold text-foreground">
                  {item.name}
                </h2>

                <div className="mt-4 space-y-2 text-sm text-muted">
                  <p>主营方向：{item.tagline ?? item.summary ?? "待补充"}</p>
                  <p>
                    地区：{item.region ?? "待补充"}
                    {item.city ? ` / ${item.city}` : ""}
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.categories.length > 0 ? (
                    item.categories.slice(0, 2).map((category) => (
                      <span
                        key={category.slug}
                        className="rounded-full border border-line bg-surface-soft px-3 py-1 text-xs text-muted"
                      >
                        {category.name}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full border border-dashed border-line px-3 py-1 text-xs text-muted">
                      暂未分类
                    </span>
                  )}
                </div>

                <div className="mt-5 rounded-3xl border border-line bg-surface-soft p-4 text-sm leading-7 text-foreground/82">
                  {item.summary ??
                    "当前品牌尚未补充简介，后续可以继续完善企业说明与合作入口信息。"}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="portal-card rounded-[28px] border border-dashed border-line p-8 text-sm leading-7 text-muted">
            {query
              ? `当前没有找到与“${query}”相关的已发布品牌。你可以更换关键词，或先在后台发布对应品牌。`
              : "当前还没有可公开访问的品牌名录。等后台发布首批品牌后，这里会形成真实的品牌入口。"}
          </div>
        )}
      </section>
    </div>
  );
}
