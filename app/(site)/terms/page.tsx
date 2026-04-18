/**
 * 文件说明：该文件实现中眠网“睡眠词库”栏目页的真实前台列表。
 * 功能说明：读取已发布 Term 数据，并按术语目录、概念入口与知识节点的角色组织筛选与分页。
 *
 * 结构概览：
 *   第一部分：导入依赖与 metadata
 *   第二部分：辅助函数与空态组件
 *   第三部分：词库目录页实现
 */

import type { Metadata } from "next";
import Link from "next/link";
import {
  ListFilterGroup,
  ListPagination,
} from "@/components/site/list-controls";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublishedTermsList } from "@/features/site/lists/server";
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

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const tag = params.tag?.trim() ?? "";
  const page = Number(params.page ?? "1");

  return buildPageMetadata({
    title: "睡眠词库",
    description:
      "从术语目录、概念定义与知识节点进入中眠网已发布的睡眠词条系统。",
    path: "/terms",
    keywords: ["睡眠词库", "睡眠术语", "睡眠概念", "睡眠障碍", "睡眠机制"],
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
            真实词条列表未就绪
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            当前无法读取真实睡眠词库目录
          </h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {message ??
              "数据库尚未就绪，因此当前词库页不会回退到 demo 数据。接入数据库后，这里会直接展示后台已发布词条。"}
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
    <form className="flex flex-col gap-3 sm:flex-row" action="/terms">
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="tag" value={tag} />
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
  const params = await searchParams;
  const result = await getPublishedTermsList({
    q: params.q,
    category: params.category,
    tag: params.tag,
    page: params.page,
    take: 12,
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
            eyebrow="术语目录 + 概念入口"
            title="从定义、分类与关联节点进入中眠网睡眠词条系统"
            description="词库页不是文章列表，而是中眠网知识底座中的概念节点目录。前台只展示已发布词条，不暴露草稿和未审核词条。"
          />
          <div className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">词条搜索</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              当前已经接入词条搜索、分类筛选、标签筛选和分页，优先保证词库入口可以直接承接公开访问。
            </p>
            <div className="mt-5">
              <SearchForm query={query} category={activeCategory} tag={activeTag} />
            </div>
            <p className="mt-4 text-sm text-muted">
              当前共有 {pagination.total} 条已发布词条。
            </p>
          </div>
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="结构筛选"
          title="按分类与标签组织词条目录"
          description="通过真实 Category 与 Tag 数据，把词库继续维持为术语目录和知识节点库，而不是内容频道。"
        />
        <div className="mt-8 space-y-6">
          <ListFilterGroup
            title="分类"
            basePath="/terms"
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
            basePath="/terms"
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
          eyebrow="已发布词条"
          title={
            query
              ? `与“${query}”相关的词条入口`
              : activeCategory || activeTag
                ? "筛选后的词条目录"
                : "当前可公开访问的睡眠词条"
          }
          description="每条词条都以定义、概念和结构化入口的方式呈现，避免词库页退回普通文章列表。"
        />

        {items.length > 0 ? (
          <>
            <div className="portal-grid lg:grid-cols-3">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/terms/${item.slug}`}
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
                    {item.shortDefinition ?? item.definition}
                  </p>

                  <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted">
                    <span>更新时间：{formatDate(item.updatedAt)}</span>
                    <span className="text-brand">查看定义</span>
                  </div>
                </Link>
              ))}
            </div>

            <ListPagination
              basePath="/terms"
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              searchParams={currentParams}
            />
          </>
        ) : (
          <div className="portal-card rounded-[28px] border border-dashed border-line p-8 text-sm leading-7 text-muted">
            {query || activeCategory || activeTag
              ? "当前筛选条件下没有找到已发布词条。你可以放宽筛选条件，或先在后台发布对应词条。"
              : "当前还没有可公开访问的睡眠词条。等后台发布首批词条后，这里会直接形成前台词库入口。"}
          </div>
        )}
      </section>
    </div>
  );
}
