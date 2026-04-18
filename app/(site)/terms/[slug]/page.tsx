/**
 * 文件说明：该文件实现中眠网前台的睡眠词条详情页。
 * 功能说明：根据 slug 读取已发布的 Term 数据，并用“定义 + 解释 + 关联节点”的方式展示词条系统。
 *
 * 结构概览：
 *   第一部分：元数据与日期格式化
 *   第二部分：数据库不可用兜底
 *   第三部分：词条详情与关联入口展示
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublishedTermDetail } from "@/features/site/details/server";

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
            词条数据未就绪
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            当前无法读取真实词条详情数据
          </h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {message ?? "数据库尚未就绪，因此词条页不会回退到 demo 数据。连接数据库并导入种子数据后，这里会直接读取后台已发布词条。"}
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
  const result = await getPublishedTermDetail(slug);

  if (!result.databaseReady || !result.data) {
    return {
      title: "睡眠词条详情 | 中眠网",
      description: "中眠网前台睡眠词条详情页。",
    };
  }

  const term = result.data;

  return {
    title: term.seoTitle ?? `${term.name} | 中眠网词条系统`,
    description:
      term.seoDescription ??
      term.shortDefinition ??
      term.definition,
  };
}

export default async function TermDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getPublishedTermDetail(slug);

  if (!result.databaseReady) {
    return <DatabaseUnavailableState message={result.error} />;
  }

  if (!result.data) {
    notFound();
  }

  const term = result.data;

  return (
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-brand">
              睡眠词条系统
            </span>
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              {term.name}
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-foreground/88">
              {term.shortDefinition ?? term.definition}
            </p>
            <div className="flex flex-wrap gap-3 text-sm text-muted">
              <span>更新时间：{formatDate(term.updatedAt)}</span>
              <span>页面类型：定义 / 概念 / 关联入口</span>
            </div>
          </div>

          <aside className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">词条页角色</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
              <p>词条页不是文章页，而是中眠网知识底座中的一个概念节点。</p>
              <p>这里优先展示定义、分类与关联入口，帮助用户继续进入问题、知识和品牌路径。</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="portal-grid lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-6">
          <section className="portal-card rounded-[28px] p-7">
            <SectionHeading
              eyebrow="所属分类"
              title="词条归类"
              description="词条的分类结构用于支撑中眠网的知识基础设施。"
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {term.categories.length > 0 ? (
                term.categories.map((category) => (
                  <span
                    key={category.slug}
                    className="rounded-full border border-line bg-surface-soft px-3 py-1 text-sm text-foreground/82"
                  >
                    {category.name}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-dashed border-line px-3 py-1 text-sm text-muted">
                  暂未补充分类
                </span>
              )}
            </div>
          </section>

          <section className="portal-card rounded-[28px] p-7">
            <SectionHeading
              eyebrow="相关词条"
              title="概念关联"
              description="通过同类词条的并列展示，强化词条系统的节点感。"
            />
            <div className="mt-6 space-y-3">
              {term.relatedTerms.length > 0 ? (
                term.relatedTerms.map((item) => (
                  <Link
                    key={item.id}
                    href={`/terms/${item.slug}`}
                    className="block rounded-3xl border border-line bg-surface-soft p-4 transition hover:border-brand"
                  >
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="mt-2 text-sm leading-7 text-muted">
                      {item.shortDefinition ?? "当前词条尚未补充一句话定义。"}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-line bg-surface-soft p-4 text-sm leading-7 text-muted">
                  当前还没有可直接展示的相关词条，后续可以继续接入更多概念关联关系。
                </div>
              )}
            </div>
          </section>
        </aside>

        <article className="portal-card rounded-[32px] p-8">
          <SectionHeading
            eyebrow="定义与解释"
            title="标准定义"
            description="这一层验证后台录入的词条定义与详细解释已经可以直接落到前台。"
          />
          <div className="mt-8 space-y-6">
            <div className="rounded-[28px] border border-line bg-surface-soft p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                一句话定义
              </p>
              <p className="mt-4 text-sm leading-8 text-foreground/86 sm:text-base">
                {term.shortDefinition ?? term.definition}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                详细解释
              </h2>
              <p className="text-sm leading-8 text-foreground/86 sm:text-base">
                {term.definition}
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                延伸说明
              </h2>
              <p className="text-sm leading-8 text-foreground/86 sm:text-base">
                {term.body?.trim()
                  ? term.body
                  : "当前词条尚未补充延伸说明，后续可以继续从诊断、设备、标准或人群场景等维度补充。"}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="相关知识入口"
          title="从词条继续进入问题与知识路径"
          description="词条系统不是终点，而是继续进入问题解释和解决路径的起点。"
        />
        <div className="mt-8 portal-grid lg:grid-cols-3">
          {term.relatedContents.length > 0 ? (
            term.relatedContents.map((content) => (
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
              当前还没有与该词条直接绑定的知识内容，后续可以在后台将词条与内容继续建立关联。
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
