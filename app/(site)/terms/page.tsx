/**
 * 文件说明：该文件实现中眠网前台“睡眠词库”栏目页的真实列表页。
 * 功能说明：读取已发布词条数据，并把栏目页组织成术语目录、概念入口和知识节点列表，而不是文章流。
 *
 * 结构概览：
 *   第一部分：元数据与辅助函数
 *   第二部分：数据库不可用与空态兜底
 *   第三部分：词条目录页面实现
 */

import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublishedTermsList } from "@/features/site/lists/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "睡眠词库 | 中眠网",
  description: "从术语目录、概念定义与知识节点进入中眠网的已发布睡眠词条系统。",
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
            词条列表未就绪
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            当前无法读取真实睡眠词条目录
          </h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {message ??
              "数据库尚未就绪，因此当前栏目页不会回退到 demo 数据。连接数据库后，这里会直接展示后台已发布词条。"}
          </p>
        </div>
      </section>
    </div>
  );
}

function SearchForm({ query }: { query: string }) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" action="/terms">
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="搜索词条名、定义或概念关键词"
        className="h-12 flex-1 rounded-full border border-line bg-white px-5 text-sm text-foreground outline-none transition focus:border-brand"
      />
      <button
        type="submit"
        className="h-12 rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-strong"
      >
        搜索词条
      </button>
    </form>
  );
}

export default async function TermsPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const result = await getPublishedTermsList({ q, take: 12 });

  if (!result.databaseReady) {
    return <DatabaseUnavailableState message={result.error} />;
  }

  const { items, categories, query, limit } = result.data;

  return (
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionHeading
            eyebrow="睡眠词条系统"
            title="从术语目录、定义与知识节点进入中眠网的知识底座"
            description="词库页不再使用 demo 卡片作为主数据源，而是直接读取已发布词条。每个词条都作为一个概念节点存在，而不是一篇文章。"
          />
          <div className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">词条搜索</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              当前已接入最小可用搜索，可按词条名、slug、短定义和定义文本检索已发布词条。
            </p>
            <div className="mt-5">
              <SearchForm query={query} />
            </div>
            <p className="mt-4 text-sm text-muted">当前目录最多展示 {limit} 个公开词条节点。</p>
          </div>
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="分类目录"
          title="先看词条系统的分类结构"
          description="这一层直接读取词条分类及已发布数量，强化术语目录和概念索引感，而不是内容频道感。"
        />
        <div className="mt-8 portal-grid sm:grid-cols-2 xl:grid-cols-4">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category.id}
                className="rounded-[28px] border border-line bg-surface-soft p-5"
              >
                <p className="text-sm text-muted">{category.name}</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">
                  {category.count}
                </p>
                <p className="mt-3 text-sm text-muted">当前分类下已发布的词条数量</p>
              </div>
            ))
          ) : (
            <div className="rounded-[28px] border border-dashed border-line bg-surface-soft p-6 text-sm leading-7 text-muted sm:col-span-2 xl:col-span-4">
              当前还没有可公开展示的词条分类，等后台发布首批词条后，这里会形成真实目录结构。
            </div>
          )}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="已发布词条节点"
          title={query ? `与“${query}”相关的词条节点` : "当前可公开访问的词条目录"}
          description="列表页只消费已发布 Term 数据。每个卡片优先展示名称、定义与分类，确保词库页继续像词条系统，而不是文章列表页。"
        />

        {items.length > 0 ? (
          <div className="portal-grid md:grid-cols-2">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/terms/${item.slug}`}
                className="portal-card rounded-[28px] p-7 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    {item.categories.length > 0 ? (
                      item.categories.slice(0, 2).map((category) => (
                        <span
                          key={category.slug}
                          className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand"
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
                  <span className="text-sm text-muted">更新于 {formatDate(item.updatedAt)}</span>
                </div>

                <h2 className="mt-5 font-serif text-2xl font-semibold text-foreground">
                  {item.name}
                </h2>
                <p className="mt-4 text-sm leading-7 text-muted">
                  {item.shortDefinition ?? item.definition}
                </p>
                <div className="mt-6 rounded-3xl border border-line bg-surface-soft px-4 py-3 text-sm text-foreground/82">
                  进入词条详情，继续查看标准定义、详细解释与相关知识入口。
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="portal-card rounded-[28px] border border-dashed border-line p-8 text-sm leading-7 text-muted">
            {query
              ? `当前没有找到与“${query}”相关的已发布词条。你可以更换关键词，或先在后台发布对应词条。`
              : "当前还没有可公开访问的词条节点。等后台发布首批词条后，这里会形成真实的词条目录。"}
          </div>
        )}
      </section>
    </div>
  );
}
