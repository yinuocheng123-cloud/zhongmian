/**
 * 文件说明：该文件实现中眠网“睡眠知识”栏目页的真实前台列表。
 * 功能说明：读取已发布 Content 数据，并按“问题入口 + 知识入口”的角色组织搜索、筛选与分页。
 *
 * 结构概览：
 *   第一部分：导入依赖与 metadata
 *   第二部分：辅助函数与空态组件
 *   第三部分：知识列表页实现
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ListActiveFilters,
  ListFilterGroup,
  ListPagination,
} from "@/components/site/list-controls";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublishedKnowledgeList } from "@/features/site/lists/server";
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

const problemEntries = ["失眠", "打呼噜", "深度睡眠", "夜醒", "儿童睡眠", "作息紊乱"] as const;
const populationEntries = ["儿童", "上班族", "老年人", "孕产人群", "长期熬夜人群"] as const;
const industryTrendLane = {
  title: "行业趋势",
  badge: "趋势解释",
  summary:
    "行业趋势作为睡眠知识的子栏目，用来解释睡眠产业中的长期变化、方法变化与结构变化，不承接逐条新闻快讯。",
  points: ["解释长期变化", "归纳技术与方法演进", "连接知识判断与行业理解"],
} as const;

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const tag = params.tag?.trim() ?? "";
  const page = Number(params.page ?? "1");

  return buildPageMetadata({
    title: "睡眠知识",
    description:
      "从问题入口、知识分类与延伸路径进入中眠网已发布的睡眠知识内容。",
    path: "/knowledge",
    keywords: ["睡眠知识", "睡眠问题", "失眠", "打呼噜", "深度睡眠"],
    // 搜索、筛选与分页页统一 noindex，避免同一列表被多组查询参数重复收录。
    noIndex: Boolean(query || category || tag || page > 1),
  });
}

function formatDate(date: Date | null) {
  if (!date) {
    return "待补充发布时间";
  }

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
            真实知识列表未就绪
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            当前无法读取真实睡眠知识列表
          </h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {message ??
              "数据库尚未就绪，因此当前栏目页不会回退到 demo 数据。接入数据库后，这里会直接展示后台已发布的睡眠知识内容。"}
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
    <form className="flex flex-col gap-3 sm:flex-row" action="/knowledge">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="tag" value={tag} />
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="搜索问题、标题或知识关键词"
        className="h-12 flex-1 rounded-full border border-line bg-white px-5 text-sm text-foreground outline-none transition focus:border-brand"
      />
      <button
        type="submit"
        className="h-12 rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-strong"
      >
        搜索知识入口
      </button>
    </form>
  );
}

export default async function KnowledgePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const result = await getPublishedKnowledgeList({
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
            eyebrow="问题入口 + 知识入口"
            title="先判断你遇到的是哪类睡眠问题，再进入已发布知识内容"
            description="知识栏目页不是普通文章流，而是把已发布内容组织成解决问题的入口。前台只消费已发布内容，不暴露草稿和未审核资源。"
          />
          <div className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">知识入口搜索</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              当前已经接入基础搜索、分类筛选、标签筛选和分页，优先保证前台知识入口可真实访问。
            </p>
            <div className="mt-5">
              <SearchForm query={query} category={activeCategory} tag={activeTag} />
            </div>
            <p className="mt-4 text-sm text-muted">
              当前共有 {pagination.total} 条已发布知识内容。
            </p>
          </div>
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="问题分类"
          title="你正在遇到的睡眠问题"
          description="这一层继续强化问题入口感，避免知识页滑回普通资讯列表页。"
        />
        <div className="mt-8 flex flex-wrap gap-3">
          {problemEntries.map((item) => (
            <span
              key={item}
              className="rounded-full border border-line bg-surface-soft px-4 py-2 text-sm text-foreground/82"
            >
              {item}
            </span>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {populationEntries.map((item) => (
            <span
              key={item}
              className="rounded-full border border-dashed border-line px-4 py-2 text-sm text-muted"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="知识子栏目"
          title="行业趋势放在睡眠知识里，按“趋势解释”组织内容"
          description="这里不是行业新闻流，而是把政策变化、技术演进、消费方向与诊疗方法变化解释清楚，作为知识入口的一部分。"
        />
        <div className="mt-8">
          <div className="rounded-[28px] border border-line bg-surface-soft p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                {industryTrendLane.badge}
              </span>
              <span className="text-sm font-semibold text-foreground">
                {industryTrendLane.title}
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted">
              {industryTrendLane.summary}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {industryTrendLane.points.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-dashed border-line px-4 py-2 text-sm text-muted"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="筛选结构"
          title="按分类与标签继续缩小知识范围"
          description="这一层直接消费真实 Category 与 Tag 数据，保持知识页的结构化入口感。"
        />
        <div className="mt-8 space-y-6">
          <ListFilterGroup
            title="分类"
            basePath="/knowledge"
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
            basePath="/knowledge"
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
          eyebrow="已发布知识内容"
          title={
            query
              ? `与“${query}”相关的知识入口`
              : activeCategory || activeTag
                ? "筛选后的知识入口"
                : "当前可公开访问的睡眠知识内容"
          }
          description="这里展示的是经过发布流转后的真实 Content 数据，卡片保留问题与知识入口感，而不是普通文章流。"
        />

        <ListActiveFilters
          basePath="/knowledge"
          searchParams={currentParams}
          labels={{
            q: "搜索",
            category: "分类",
            tag: "标签",
          }}
        />

        {items.length > 0 ? (
          <>
            <div className="portal-grid lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/knowledge/${encodeURIComponent(item.slug)}`}
                  className="portal-card rounded-[28px] p-7 transition hover:-translate-y-0.5 hover:border-brand"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                      {item.contentType}
                    </span>
                    {item.categories.slice(0, 1).map((category) => (
                      <span
                        key={category.slug}
                        className="rounded-full border border-line bg-surface-soft px-3 py-1 text-xs text-muted"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>

                  <h2 className="mt-5 font-serif text-2xl font-semibold text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    {item.summary ?? "当前内容尚未补充摘要。"}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {item.tags.length > 0 ? (
                      item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag.slug}
                          className="rounded-full border border-line bg-surface-soft px-3 py-1 text-xs text-muted"
                        >
                          #{tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-dashed border-line px-3 py-1 text-xs text-muted">
                        暂无标签
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted">
                    <span>发布时间：{formatDate(item.publishedAt)}</span>
                    <span className="text-brand">进入详情</span>
                  </div>
                </Link>
              ))}
            </div>

            <ListPagination
              basePath="/knowledge"
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              searchParams={currentParams}
            />
          </>
        ) : (
          <div className="portal-card rounded-[28px] border border-dashed border-line p-8 text-sm leading-7 text-muted">
            {query || activeCategory || activeTag
              ? "当前筛选条件下没有找到已发布知识内容。你可以清空筛选后重新查看，或先在后台发布对应内容。"
              : "当前还没有可公开访问的睡眠知识内容。等后台发布首批知识内容后，这里会直接形成前台知识入口。"}
          </div>
        )}
      </section>
    </div>
  );
}
