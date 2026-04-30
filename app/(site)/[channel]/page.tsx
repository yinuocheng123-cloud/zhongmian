/**
 * 文件说明：该文件实现中眠网预留扩展栏目的前台列表页。
 * 功能说明：统一承接行业趋势、行业事件、品牌进展、中眠榜、中眠指数、睡眠标准、
 * 中眠智库与企业合作栏目，确保首页所有入口都能进入真实频道页而不是空占位页。
 *
 * 结构概览：
 *   第一部分：导入依赖与频道辅助函数
 *   第二部分：metadata、静态参数与空态组件
 *   第三部分：合作页与通用频道列表页实现
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ListActiveFilters,
  ListFilterGroup,
  ListPagination,
} from "@/components/site/list-controls";
import { SectionHeading } from "@/components/shared/section-heading";
import { getPublishedChannelContentList } from "@/features/site/lists/server";
import { buildPageMetadata } from "@/lib/seo";
import {
  getManagedChannelBySlug,
  getSiteChannelConfig,
  siteChannelConfigs,
} from "@/lib/site-channels";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    channel: string;
  }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
    page?: string;
  }>;
};

const cooperationCards = [
  {
    title: "品牌收录",
    summary:
      "为睡眠品牌、机构与企业提供基础资料收录、结构化展示与行业入口曝光支持。",
  },
  {
    title: "品牌展示",
    summary:
      "围绕品牌名录、品牌进展与专题内容形成前台公开展示与行业参考入口。",
  },
  {
    title: "榜单合作",
    summary:
      "为品牌、产品与服务提供榜单共建、评估维度说明与行业参考展示能力。",
  },
  {
    title: "指数合作",
    summary:
      "承接睡眠消费、关注度、区域样本等指数合作，用结构化说明沉淀数据解释。",
  },
  {
    title: "智库合作",
    summary:
      "支持行业研究、白皮书、专题观察与报告共建，强化中眠网的行业参考属性。",
  },
  {
    title: "内容增信",
    summary:
      "通过标准、报告、品牌资料与栏目协同，为公开内容提供更稳定的行业增信表达。",
  },
] as const;

const cooperationOverviewCards = [
  {
    title: "适合谁",
    description:
      "适合希望建立行业可信展示与长期内容资产的睡眠品牌、睡眠产品企业、睡眠医疗与监测机构、产业服务商，以及希望参与榜单、指数、智库合作的行业伙伴。",
  },
  {
    title: "解决什么问题",
    description:
      "帮助企业解决“有产品但缺行业展示入口、有能力但缺可信背书、有内容但缺结构化表达、有合作诉求但缺稳定对接窗口”的问题，让品牌信息、行业进展、研究内容与合作方向被更清楚地看见和理解。",
  },
  {
    title: "交付什么结果",
    description:
      "中眠网可提供品牌收录与展示、品牌进展呈现、行业趋势与智库内容协同、榜单与指数合作说明、内容增信与行业参考露出等结果，帮助企业形成可持续的线上行业入口与对外展示资产。",
  },
  {
    title: "客户需要配合什么",
    description:
      "客户需提供基础企业资料、品牌介绍、主营方向、地区信息、可公开发布的产品或服务信息，以及合作目标与期望展示方向；如涉及榜单、指数、智库或专题合作，还需配合提供必要的公开材料、说明口径与联系人信息。",
  },
] as const;

const questionHotspots = {
  trends: ["消费趋势", "渠道变化", "服务结构", "数据观察"],
  events: ["展会", "论坛", "发布会", "年度节点"],
  "brand-progress": ["主营变化", "区域扩展", "产品方向", "能力更新"],
  rankings: ["评估维度", "入榜对象", "排序说明", "发布时间"],
  indexes: ["关注度", "消费变化", "城市睡眠", "职业睡眠"],
  standards: ["适用范围", "版本号", "核心条目", "术语边界"],
  "think-tank": ["白皮书", "研究报告", "专题观察", "专家观点"],
} as const;

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

function DatabaseUnavailableState({
  title,
  message,
}: {
  title: string;
  message?: string;
}) {
  return (
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            真实栏目数据未就绪
          </span>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            当前无法读取 {title} 的真实公开内容
          </h1>
          <p className="text-sm leading-7 text-muted sm:text-base">
            {message ??
              "数据库尚未就绪，因此当前栏目页不会回退到 demo 数据。接入数据库后，这里会直接展示后台已发布内容。"}
          </p>
        </div>
      </section>
    </div>
  );
}

function SearchForm({
  action,
  query,
  category,
  tag,
  placeholder,
}: {
  action: string;
  query: string;
  category: string;
  tag: string;
  placeholder: string;
}) {
  return (
    <form className="flex flex-col gap-3 sm:flex-row" action={action}>
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="tag" value={tag} />
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder={placeholder}
        className="h-12 flex-1 rounded-full border border-line bg-white px-5 text-sm text-foreground outline-none transition focus:border-brand"
      />
      <button
        type="submit"
        className="h-12 rounded-full bg-brand px-6 text-sm font-semibold text-white transition hover:bg-brand-strong"
      >
        搜索栏目内容
      </button>
    </form>
  );
}

export async function generateStaticParams() {
  return Object.keys(siteChannelConfigs).map((channel) => ({ channel }));
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { channel } = await params;
  const config = getSiteChannelConfig(channel);

  if (!config) {
    return buildPageMetadata({
      title: "栏目不存在",
      description: "当前栏目不存在或尚未开放。",
      path: "/",
      noIndex: true,
    });
  }

  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q?.trim() ?? "";
  const category = resolvedSearchParams.category?.trim() ?? "";
  const tag = resolvedSearchParams.tag?.trim() ?? "";
  const page = Number(resolvedSearchParams.page ?? "1");

  return buildPageMetadata({
    title: config.title,
    description: config.description,
    path: config.path,
    keywords: [...config.seoKeywords],
    noIndex: Boolean(query || category || tag || page > 1),
  });
}

function CooperationPage() {
  const config = siteChannelConfigs.cooperation;

  return (
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionHeading
            eyebrow={config.listEyebrow}
            title={config.listTitle}
            description={config.listDescription}
          />
          <div className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">合作定位</p>
            <p className="mt-3 text-sm leading-7 text-muted">{config.purpose}</p>
            <div className="mt-5 space-y-2 text-sm text-muted">
              <p>适配对象：品牌、机构、研究团队、服务商、展会与合作方。</p>
              <p>当前阶段：以合作说明和联系入口为主，不强制复杂表单。</p>
              <p>联系占位：请在正式上线时替换为企业邮箱、微信或商务联系人。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="合作方向"
          title={config.collaborationTitle ?? "可承接的合作方向"}
          description={
            config.collaborationDescription ??
            "中眠网可承接品牌展示、榜单指数、智库内容和内容增信等合作方向。"
          }
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {cooperationCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[28px] border border-line bg-surface-soft p-6"
            >
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                {card.title}
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted">{card.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="合作判断"
          title="先判断这项合作是否适合中眠网当前阶段"
          description="这四个问题用于帮助合作方快速判断：是否适合合作、当前要解决什么问题、最终能交付什么，以及需要提前准备什么。"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {cooperationOverviewCards.map((block) => (
            <article
              key={block.title}
              className="rounded-[28px] border border-line bg-surface-soft p-6 shadow-sm shadow-slate-900/5"
            >
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                {block.title}
              </h2>
              <p className="mt-4 text-sm leading-8 text-muted">
                {block.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="推荐入口"
          title="先进入相关栏目，再决定合作方式"
          description="合作页优先解释中眠网能做什么，同时把用户引导回词库、品牌、榜单、指数与智库等正式栏目。"
        />
        <div className="mt-8 flex flex-wrap gap-3">
          {[
            { label: "进入睡眠品牌", href: "/brands" },
            { label: "查看品牌进展", href: "/brand-progress" },
            { label: "查看中眠榜", href: "/rankings" },
            { label: "查看中眠指数", href: "/indexes" },
            { label: "查看中眠智库", href: "/think-tank" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:border-brand hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default async function ReservedChannelPage({
  params,
  searchParams,
}: PageProps) {
  const { channel } = await params;
  const config = getSiteChannelConfig(channel);

  if (!config) {
    notFound();
  }

  if (config.slug === "cooperation") {
    return <CooperationPage />;
  }

  const managedChannel = getManagedChannelBySlug(channel);

  if (!managedChannel?.channelKey) {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const result = await getPublishedChannelContentList(
    {
      q: resolvedSearchParams.q,
      category: resolvedSearchParams.category,
      tag: resolvedSearchParams.tag,
      page: resolvedSearchParams.page,
      take: 9,
    },
    {
      channelKey: managedChannel.channelKey,
      contentTypes: managedChannel.allowedContentTypes,
    },
  );

  if (!result.databaseReady) {
    return <DatabaseUnavailableState title={config.title} message={result.error} />;
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

  const hotspots =
    questionHotspots[managedChannel.slug as keyof typeof questionHotspots] ?? [];

  return (
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <SectionHeading
            eyebrow={managedChannel.listEyebrow}
            title={managedChannel.listTitle}
            description={managedChannel.listDescription}
          />
          <div className="rounded-[28px] border border-line bg-surface-soft p-6">
            <p className="text-sm font-semibold text-brand">{managedChannel.shortTitle}入口搜索</p>
            <p className="mt-3 text-sm leading-7 text-muted">
              当前栏目页直接消费后台已发布内容，前台只展示 PUBLISHED 数据，不暴露草稿和未审核资源。
            </p>
            <div className="mt-5">
              <SearchForm
                action={managedChannel.path}
                query={query}
                category={activeCategory}
                tag={activeTag}
                placeholder={`搜索${managedChannel.title}中的标题、摘要、地点或相关品牌`}
              />
            </div>
            <p className="mt-4 text-sm text-muted">
              当前共有 {pagination.total} 条已发布内容。
            </p>
          </div>
        </div>
      </section>

      <section className="portal-card rounded-[32px] p-8">
        <SectionHeading
          eyebrow="栏目作用"
          title={`这个栏目主要解决什么问题？`}
          description={managedChannel.purpose}
        />
        <div className="mt-8 flex flex-wrap gap-3">
          {hotspots.map((item: string) => (
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
          eyebrow="筛选结构"
          title="按分类与标签继续缩小栏目范围"
          description="栏目页继续沿用中眠网的结构化筛选方式，帮助用户从公开内容中快速缩小范围。"
        />
        <div className="mt-8 space-y-6">
          <ListFilterGroup
            title="分类"
            basePath={managedChannel.path}
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
            basePath={managedChannel.path}
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
          eyebrow={managedChannel.itemEyebrow}
          title={
            query
              ? `与“${query}”相关的 ${managedChannel.title} 内容`
              : activeCategory || activeTag
                ? `${managedChannel.title} 筛选结果`
                : `当前可公开访问的 ${managedChannel.title}`
          }
          description={`这里展示的是已经完成发布流转的真实内容，保持 ${managedChannel.title} 的栏目语义，不退回普通资讯流。`}
        />

        <ListActiveFilters
          basePath={managedChannel.path}
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
                  href={`${managedChannel.detailPrefix}/${encodeURIComponent(item.slug)}`}
                  className="portal-card rounded-[28px] p-7 transition hover:-translate-y-0.5 hover:border-brand"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-line bg-surface-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80">
                      {managedChannel.itemEyebrow}
                    </span>
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
                    {item.title}
                  </h2>
                  <p className="mt-4 text-sm leading-7 text-muted">
                    {item.summary ?? "当前内容尚未补充摘要说明。"}
                  </p>

                  {managedChannel.requiresEventMeta ? (
                    <div className="mt-5 space-y-2 text-sm text-muted">
                      <p>时间：{formatDate(item.eventStartAt ?? item.publishedAt)}</p>
                      <p>地点：{item.eventLocation ?? "待补充事件地点"}</p>
                      <p>类型：{item.eventKind ?? "待补充事件类型"}</p>
                    </div>
                  ) : null}

                  {managedChannel.slug === "brand-progress" ? (
                    <div className="mt-5 space-y-2 text-sm text-muted">
                      <p>
                        关联品牌：
                        {item.relatedBrands.length > 0
                          ? item.relatedBrands.map((brand) => brand.name).join(" / ")
                          : "待关联品牌主体"}
                      </p>
                      <p>最近更新：{formatDate(item.updatedAt)}</p>
                    </div>
                  ) : null}

                  {managedChannel.requiresReferenceVersion ? (
                    <div className="mt-5 space-y-2 text-sm text-muted">
                      <p>版本号：{item.referenceVersion ?? "待补充标准版本号"}</p>
                      <p>发布时间：{formatDate(item.publishedAt)}</p>
                    </div>
                  ) : null}

                  {managedChannel.slug === "rankings" || managedChannel.slug === "indexes" ? (
                    <div className="mt-5 space-y-2 text-sm text-muted">
                      <p>发布时间：{formatDate(item.publishedAt)}</p>
                      <p>更新时间：{formatDate(item.updatedAt)}</p>
                    </div>
                  ) : null}

                  {!managedChannel.requiresEventMeta &&
                  managedChannel.slug !== "brand-progress" &&
                  !managedChannel.requiresReferenceVersion &&
                  managedChannel.slug !== "rankings" &&
                  managedChannel.slug !== "indexes" ? (
                    <div className="mt-6 flex items-center justify-between gap-4 text-sm text-muted">
                      <span>发布时间：{formatDate(item.publishedAt)}</span>
                      <span className="text-brand">查看详情</span>
                    </div>
                  ) : (
                    <div className="mt-6 text-sm font-medium text-brand">查看详情</div>
                  )}
                </Link>
              ))}
            </div>

            <ListPagination
              basePath={managedChannel.path}
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              searchParams={currentParams}
            />
          </>
        ) : (
          <div className="portal-card rounded-[28px] border border-dashed border-line p-8 text-sm leading-7 text-muted">
            {query || activeCategory || activeTag
              ? `当前筛选条件下没有找到已发布的${managedChannel.title}内容。你可以清空筛选后重新查看，或先在后台发布对应内容。`
              : managedChannel.emptyDescription}
          </div>
        )}
      </section>
    </div>
  );
}
