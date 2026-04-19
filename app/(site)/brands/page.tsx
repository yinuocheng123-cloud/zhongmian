/**
 * 文件说明：该文件实现中眠网“睡眠品牌”栏目页的真实前台列表。
 * 功能说明：读取已发布 Brand 数据，并按行业名录、信任展示与商业入口的角色组织搜索、筛选与分页。
 *
 * 结构概览：
 *   第一部分：导入依赖与 metadata
 *   第二部分：辅助函数与空态组件
 *   第三部分：品牌列表页实现
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ListFilterGroup,
  ListPagination,
} from "@/components/site/list-controls";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublishedBrandsList } from "@/features/site/lists/server";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
};

const brandSubColumns = [
  {
    title: "行业事件",
    badge: "事件归纳",
    summary:
      "行业事件作为睡眠品牌的子栏目，归纳会议、展会、合作、发布与标准动作，服务品牌理解与行业参考，不做快讯流。",
    points: ["会议与展会节点", "合作与发布动作", "行业重要事件归纳"],
  },
  {
    title: "品牌进展",
    badge: "结构更新",
    summary:
      "品牌进展作为睡眠品牌的子栏目，围绕品牌收录、主营调整、地区扩展与能力变化做结构化更新，不做企业新闻流。",
    points: ["品牌收录更新", "主营方向变化", "地区与能力扩展"],
  },
] as const;

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const tag = params.tag?.trim() ?? "";
  const page = Number(params.page ?? "1");

  return buildPageMetadata({
    title: "睡眠品牌",
    description:
      "查看中眠网已发布的睡眠品牌、企业与机构名录，作为行业参考与合作入口。",
    path: "/brands",
    keywords: ["睡眠品牌", "睡眠企业", "睡眠行业名录", "睡眠机构"],
    noIndex: Boolean(query || category || tag || page > 1),
  });
}

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
            真实品牌列表未就绪
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            当前无法读取真实睡眠品牌名录
          </h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {message ??
              "数据库尚未就绪，因此当前品牌页不会回退到 demo 数据。接入数据库后，这里会直接展示后台已发布品牌。"}
          </p>
        </div>
      </section>
    </div>
  );
}

function SearchForm({
  query,
  category,
  tag,
}: {
  query: string;
  category: string;
  tag: string;
}) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" action="/brands">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="tag" value={tag} />
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
        搜索品牌
      </button>
    </form>
  );
}

export default async function BrandsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await getPublishedBrandsList({
    q: params.q,
    category: params.category,
    tag: params.tag,
    page: params.page,
    take: 9,
  });

  if (!result.databaseReady) {
    return <DatabaseUnavailableState message={result.error} />;
  }

  const {
    items,
    categories,
    tags,
    query,
    activeCategory,
    activeTag,
    pagination,
  } = result.data;

  const currentParams = {
    q: query || undefined,
    category: activeCategory || undefined,
    tag: activeTag || undefined,
    page: pagination.page > 1 ? String(pagination.page) : undefined,
  };

  return (
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionHeading
            eyebrow="行业名录 + 信任展示"
            title="从分类、地区与主营方向进入中眠网睡眠品牌名录"
            description="品牌页优先承担行业参考、企业展示与合作入口角色。前台只展示已发布品牌，不暴露草稿和未审核品牌。"
          />
          <div className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">品牌入口搜索</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              当前已经接入品牌搜索、分类筛选、标签筛选和分页，优先保证品牌名录入口真实可访问。
            </p>
            <div className="mt-5">
              <SearchForm query={query} category={activeCategory} tag={activeTag} />
            </div>
            <p className="mt-4 text-sm text-muted">
              当前共有 {pagination.total} 个已发布品牌。
            </p>
          </div>
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="品牌子栏目"
          title="行业事件与品牌进展都归入睡眠品牌，按“归纳 + 更新”组织"
          description="品牌栏目不做企业新闻集合，而是用行业事件沉淀行业节点，用品牌进展沉淀企业名录与能力结构变化。"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {brandSubColumns.map((item) => (
            <div
              key={item.title}
              className="rounded-[28px] border border-line bg-surface-soft p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                  {item.badge}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {item.title}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-muted">{item.summary}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {item.points.map((point) => (
                  <span
                    key={point}
                    className="rounded-full border border-dashed border-line px-4 py-2 text-sm text-muted"
                  >
                    {point}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="筛选结构"
          title="按分类与标签继续缩小品牌名录范围"
          description="通过真实 Category 与 Tag 数据强化品牌页的行业名录感，而不是把它做成普通内容列表。"
        />
        <div className="mt-8 space-y-6">
          <ListFilterGroup
            title="分类"
            basePath="/brands"
            paramName="category"
            items={categories.map((item) => ({
              label: item.name,
              value: item.slug,
              count: item.count,
            }))}
            searchParams={currentParams}
            emptyLabel="暂无分类"
          />
          <ListFilterGroup
            title="标签"
            basePath="/brands"
            paramName="tag"
            items={tags.map((item) => ({
              label: item.name,
              value: item.slug,
              count: item.count,
            }))}
            searchParams={currentParams}
            emptyLabel="暂无标签"
          />
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="已发布品牌"
          title={
            query
              ? `与“${query}”相关的品牌入口`
              : activeCategory || activeTag
                ? "筛选后的品牌名录"
                : "当前可公开访问的睡眠品牌"
          }
          description="卡片以企业名片结构呈现，优先突出品牌分类、地区、主营方向与行业参考属性。"
        />

        {items.length > 0 ? (
          <>
            <div className="portal-grid lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/brands/${item.slug}`}
                  className="portal-card rounded-[28px] p-7 transition hover:-translate-y-0.5 hover:border-brand"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {item.categories.slice(0, 1).map((category) => (
                      <span
                        key={category.slug}
                        className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand"
                      >
                        {category.name}
                      </span>
                    ))}
                    {item.tags.slice(0, 1).map((tag) => (
                      <span
                        key={tag.slug}
                        className="rounded-full border border-line bg-surface-soft px-3 py-1 text-xs text-muted"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>

                  <h2 className="mt-5 font-serif text-2xl font-semibold text-foreground">
                    {item.name}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    {item.tagline ?? item.summary ?? "当前品牌尚未补充简介。"}
                  </p>

                  <div className="mt-5 space-y-2 text-sm text-muted">
                    <p>地区：{item.region ?? "待补充"}</p>
                    <p>城市：{item.city ?? "待补充"}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted">
                    <span>更新时间：{formatDate(item.updatedAt)}</span>
                    <span className="text-brand">查看品牌详情</span>
                  </div>
                </Link>
              ))}
            </div>

            <ListPagination
              basePath="/brands"
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              searchParams={currentParams}
            />
          </>
        ) : (
          <div className="portal-card rounded-[28px] border border-dashed border-line p-8 text-sm leading-7 text-muted">
            {query || activeCategory || activeTag
              ? "当前筛选条件下没有找到已发布品牌。你可以放宽筛选条件，或先在后台发布对应品牌。"
              : "当前还没有可公开访问的睡眠品牌。等后台发布首批品牌后，这里会直接形成前台品牌入口。"}
          </div>
        )}
      </section>
    </div>
  );
}
