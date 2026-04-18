/**
 * 文件说明：该文件实现中眠网前台“睡眠知识”栏目页的真实列表页。
 * 功能说明：读取已发布的知识内容数据，并以“问题入口 + 知识入口”的方式组织前台访问主路径。
 *
 * 结构概览：
 *   第一部分：元数据、查询类型与辅助函数
 *   第二部分：数据库不可用与空态兜底
 *   第三部分：知识入口页面实现
 */

import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublishedKnowledgeList } from "@/features/site/lists/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "睡眠知识 | 中眠网",
  description: "从问题入口与知识入口进入中眠网的已发布睡眠知识内容。",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

const problemEntries = [
  "失眠",
  "打呼噜",
  "深度睡眠",
  "夜醒",
  "儿童睡眠",
  "作息紊乱",
] as const;

const populationEntries = [
  "儿童",
  "上班族",
  "老年人",
  "孕产人群",
  "长期熬夜人群",
] as const;

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
            知识列表未就绪
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            当前无法读取真实睡眠知识列表
          </h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {message ??
              "数据库尚未就绪，因此当前栏目页不会回退到 demo 数据。接入数据库后，这里会直接展示后台已发布的知识内容。"}
          </p>
        </div>
      </section>
    </div>
  );
}

function SearchForm({ query }: { query: string }) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" action="/knowledge">
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="搜索问题、知识标题或关键词"
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
  const { q } = await searchParams;
  const result = await getPublishedKnowledgeList({ q, take: 9 });

  if (!result.databaseReady) {
    return <DatabaseUnavailableState message={result.error} />;
  }

  const { items, query, limit } = result.data;

  return (
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionHeading
            eyebrow="问题入口 + 知识入口"
            title="先判断你遇到的是哪类睡眠问题，再进入已发布知识内容"
            description="知识栏目页不把自己定义成文章流，而是把已发布内容组织成解决问题的入口。前台只读取已发布的知识内容，不展示草稿或未审核资源。"
          />
          <div className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">知识入口搜索</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              当前已接入最小可用搜索，只按标题、摘要与 slug 检索已发布知识内容，后续再补更多筛选。
            </p>
            <div className="mt-5">
              <SearchForm query={query} />
            </div>
            <p className="mt-4 text-sm text-muted">当前列表最多展示 {limit} 条公开知识内容。</p>
          </div>
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="问题分类"
          title="你正在遇到的睡眠问题"
          description="这一层继续强调问题入口感，避免知识页滑回普通资讯列表页。"
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

      <section className="space-y-6">
        <SectionHeading
          eyebrow="已发布知识内容"
          title={query ? `与“${query}”相关的知识入口` : "当前可公开访问的睡眠知识内容"}
          description="这里展示的是已经通过发布流程的真实 Content 数据。列表卡片保留问题与知识入口感，不退回到普通文章流表达。"
        />

        {items.length > 0 ? (
          <div className="portal-grid lg:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/knowledge/${item.slug}`}
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
        ) : (
          <div className="portal-card rounded-[28px] border border-dashed border-line p-8 text-sm leading-7 text-muted">
            {query
              ? `当前没有找到与“${query}”相关的已发布知识内容。你可以更换关键词，或先在后台发布对应内容。`
              : "当前还没有可公开访问的睡眠知识内容。等后台发布首批知识内容后，这里会直接形成前台知识入口。"}
          </div>
        )}
      </section>
    </div>
  );
}
