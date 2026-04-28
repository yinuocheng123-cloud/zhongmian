/**
 * 文件说明：该文件实现中眠网首页的行业入口布局。
 * 功能说明：显性呈现基础知识入口、信任入口与商业入口，并把首页所有核心入口收口到可访问路由。
 *
 * 结构概览：
 *   第一部分：导入依赖与 metadata
 *   第二部分：首页静态入口配置与兜底内容
 *   第三部分：辅助格式化函数
 *   第四部分：首页页面实现
 */

import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import {
  getPublishedBrandsList,
  getPublishedKnowledgeList,
  getPublishedTermsList,
} from "@/features/site/lists/server";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPageMetadata({
  title: "中眠网",
  description:
    "中国睡眠产业知识入口与行业参考平台，覆盖睡眠知识、词库、品牌、趋势、事件与品牌进展。",
  path: "/",
  keywords: [
    "中眠网",
    "睡眠知识",
    "睡眠词库",
    "睡眠品牌",
    "行业趋势",
    "行业事件",
    "品牌进展",
  ],
});

const coreEntryCards = [
  {
    title: "睡眠知识",
    summary: "从问题、原因、建议与延伸阅读进入睡眠知识体系。",
    href: "/knowledge",
    badge: "基础知识入口",
  },
  {
    title: "睡眠词库",
    summary: "从概念、定义与术语节点进入中眠网知识底座。",
    href: "/terms",
    badge: "术语目录",
  },
  {
    title: "睡眠品牌",
    summary: "查看品牌、机构、地区与主营方向，建立行业参考。",
    href: "/brands",
    badge: "品牌名录",
  },
  {
    title: "行业趋势",
    summary: "围绕趋势解释与长期变化理解睡眠产业的发展方向。",
    href: "/trends",
    badge: "趋势解释",
  },
  {
    title: "行业事件",
    summary: "围绕展会、论坛、发布会与合作动作做结构化归纳。",
    href: "/events",
    badge: "事件归纳",
  },
  {
    title: "品牌进展",
    summary: "围绕品牌能力变化、产品方向与企业进展做结构化更新。",
    href: "/brand-progress",
    badge: "结构更新",
  },
  {
    title: "中眠智库 / 行业参考",
    summary: "通过榜单、指数、标准与智库入口建立更稳的行业判断框架。",
    href: "/think-tank",
    badge: "行业参考",
  },
] as const;

const hotProblems = [
  "失眠",
  "打呼噜",
  "夜醒",
  "深度睡眠",
  "儿童睡眠",
  "作息紊乱",
] as const;

const trustCards = [
  {
    title: "中眠榜",
    summary: "面向品牌、机构与服务能力形成可被参考的行业榜单入口。",
    href: "/rankings",
  },
  {
    title: "中眠指数",
    summary: "沉淀趋势观察、热度变化与行业信号，形成更直观的数据参考入口。",
    href: "/indexes",
  },
  {
    title: "睡眠标准",
    summary: "承接术语、检测、产品与服务规范，强化平台专业边界与可信度。",
    href: "/standards",
  },
  {
    title: "中眠智库",
    summary: "沉淀研究、报告、专题判断与行业观点，形成更高层的行业参考入口。",
    href: "/think-tank",
  },
] as const;

const businessCards = [
  {
    title: "品牌收录",
    summary: "面向品牌、机构与服务商开放基础收录与名录展示入口。",
    href: "/cooperation",
  },
  {
    title: "行业合作",
    summary: "承接专题共建、联合传播、活动协作与产业研究合作需求。",
    href: "/cooperation",
  },
  {
    title: "榜单 / 指数 / 智库合作",
    summary: "围绕榜单、指数与行业参考能力提供联合建设与合作入口。",
    href: "/cooperation",
  },
] as const;

const fallbackTermCards = [
  {
    title: "REM 睡眠",
    definition: "指快速眼动睡眠阶段，常与梦境、情绪处理和记忆整合相关。",
    category: "睡眠机制",
  },
  {
    title: "睡眠效率",
    definition: "指实际睡眠时长占卧床总时长的比例，是常见睡眠指标之一。",
    category: "睡眠指标",
  },
  {
    title: "睡眠呼吸暂停",
    definition: "指睡眠过程中反复出现呼吸暂停或低通气的睡眠相关障碍。",
    category: "睡眠障碍",
  },
] as const;

const fallbackKnowledgeCards = [
  {
    title: "为什么总是夜里醒来：从作息、压力到睡眠环境的排查路径",
    summary: "用“问题—原因—建议”的结构承接用户最常见的夜醒问题。",
    badge: "问题解释",
  },
  {
    title: "深度睡眠到底重要在哪里：从恢复感到白天状态的基础理解",
    summary: "把深度睡眠作为知识入口，帮助用户理解睡眠机制与恢复逻辑。",
    badge: "知识解读",
  },
  {
    title: "行业趋势怎么看：睡眠监测、环境优化与家庭睡眠方案的变化方向",
    summary: "用趋势解读而不是资讯快讯的方式承接行业趋势入口。",
    badge: "趋势解读",
  },
  {
    title: "儿童睡眠问题的常见误区：家长应先看哪些信号与建议路径",
    summary: "从人群场景切入知识栏目，强化睡眠问题的解决路径感。",
    badge: "人群专题",
  },
] as const;

const fallbackBrandCards = [
  {
    name: "眠域科技",
    summary: "围绕家庭睡眠监测与数据服务建立基础行业参考入口。",
    region: "华东",
    city: "上海",
  },
  {
    name: "深眠研究院",
    summary: "以专题研究、科普内容与智库协作为核心，适合作为行业参考主体展示。",
    region: "华北",
    city: "北京",
  },
  {
    name: "舒睡空间",
    summary: "围绕床垫、睡眠环境与空间方案形成品牌名录入口。",
    region: "华南",
    city: "深圳",
  },
] as const;

function formatDate(date: Date | null) {
  if (!date) {
    return "待补充时间";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function encodeSlug(slug: string) {
  return encodeURIComponent(slug);
}

function buildKnowledgeQueryHref(query: string) {
  return `/knowledge?q=${encodeURIComponent(query)}`;
}

export default async function HomePage() {
  const [knowledgeResult, termsResult, brandsResult] = await Promise.all([
    getPublishedKnowledgeList({ take: 4 }),
    getPublishedTermsList({ take: 6 }),
    getPublishedBrandsList({ take: 4 }),
  ]);

  const knowledgeItems = knowledgeResult.data.items;
  const termItems = termsResult.data.items;
  const brandItems = brandsResult.data.items;
  const latestKnowledgeItems = knowledgeItems.slice(0, 3);

  return (
    <div className="portal-shell space-y-10">
      {/* ========== 第一部分：平台定位区 ========== */}
      <section className="relative overflow-hidden rounded-[36px] border border-slate-700 bg-[#0F172A] p-8 text-white shadow-[0_34px_80px_rgba(15,23,42,0.34)] sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#3B82F6]/16 blur-3xl" />
          <div className="absolute right-0 top-10 h-56 w-56 rounded-full bg-[#60A5FA]/12 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-[#F59E0B]/10 blur-3xl" />
        </div>

        <div className="relative grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-medium text-[#FCD34D]">
              行业入口首页
            </span>

            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#93C5FD]">
                中眠网
              </p>
              <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                中国睡眠产业知识入口与行业参考平台
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                覆盖睡眠知识、词库、品牌、趋势、事件与品牌进展，让用户先看到知识入口，
                再看到行业参考，再进入品牌与合作入口，而不是先掉进内容流。
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/knowledge"
                className="rounded-full bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2563EB]"
              >
                查睡眠知识
              </Link>
              <Link
                href="/terms"
                className="rounded-full border border-white/16 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                看睡眠词库
              </Link>
              <Link
                href="/brands"
                className="rounded-full border border-white/16 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                浏览品牌名录
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                "这是睡眠知识入口",
                "这是行业参考入口",
                "这是品牌与产业入口",
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-[24px] border border-white/12 bg-[#1E293B] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#60A5FA]">
                    0{index + 1}
                  </p>
                  <p className="mt-3 text-base font-semibold leading-7 text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <article className="rounded-[28px] border border-white/12 bg-[#1E293B] p-6 shadow-[0_18px_35px_rgba(15,23,42,0.2)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#93C5FD]">
                平台判断
              </p>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-white">
                先给入口，再给内容
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/82">
                首页优先回答“中眠网是什么、从哪里进入、它为什么值得参考”，而不是先把最新内容堆到第一屏。
              </p>
            </article>

            <article className="rounded-[28px] border border-white/12 bg-[#1E293B] p-6 shadow-[0_18px_35px_rgba(15,23,42,0.2)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#93C5FD]">
                轻量后台入口
              </p>
              <h2 className="mt-3 font-serif text-2xl font-semibold text-white">
                运营与 AI 编辑部入口保持克制
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/82">
                首页不重暴露后台，但保留运营入口，方便内容团队快速进入编辑与发布流程。
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/admin/login"
                  className="rounded-full border border-white/16 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
                >
                  后台运营入口
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ========== 第二部分：七大核心入口区 ========== */}
      <section className="portal-card rounded-[32px] border border-line bg-white p-8">
        <SectionHeading
          eyebrow="七大核心入口"
          title="先把行业入口摆全，再谈内容流"
          description="七个入口分别承接知识、词库、品牌、趋势、事件、品牌进展与行业参考，让用户第一眼知道中眠网不是普通资讯站。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {coreEntryCards.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className={`rounded-[28px] border p-6 transition hover:-translate-y-0.5 ${
                index < 3
                  ? "border-[#BFDBFE] bg-[#F8FBFF] hover:border-[#60A5FA]"
                  : "border-line bg-surface-soft hover:border-[#CBD5E1]"
              }`}
            >
              <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">
                {item.badge}
              </span>
              <h2 className="mt-4 font-serif text-2xl font-semibold text-foreground">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted">{item.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== 第三部分：热门问题入口区 ========== */}
      <section className="portal-card rounded-[32px] border border-line bg-surface-soft p-8">
        <SectionHeading
          eyebrow="热门问题入口"
          title="从用户最常见的睡眠问题进入"
          description="这一层优先服务普通用户与搜索流量，把睡眠问题入口放在前面，承接知识入口而不是做文章列表。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hotProblems.map((item) => (
            <Link
              key={item}
              href={buildKnowledgeQueryHref(item)}
              className="rounded-[24px] border border-line bg-white px-5 py-5 transition hover:-translate-y-0.5 hover:border-brand"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">
                问题入口
              </p>
              <h3 className="mt-3 font-serif text-2xl font-semibold text-foreground">{item}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                进入与“{item}”相关的问题解释、原因判断、建议路径与延伸阅读。
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== 第四部分：睡眠词库精选区 ========== */}
      <section className="portal-card rounded-[32px] border border-line bg-white p-8">
        <SectionHeading
          eyebrow="睡眠词库精选"
          title="先看术语与定义，再看内容解释"
          description="词库区更像术语目录与概念入口，不像文章列表。优先突出词条名、一句话定义与概念节点属性。"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {(termItems.length > 0 ? termItems : fallbackTermCards).map((item) =>
            "id" in item ? (
              <Link
                key={item.id}
                href={`/terms/${encodeSlug(item.slug)}`}
                className="rounded-[28px] border border-line bg-surface-soft p-6 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                    术语节点
                  </span>
                  {item.categories.slice(0, 1).map((category) => (
                    <span
                      key={category.slug}
                      className="rounded-full border border-line bg-white px-3 py-1 text-xs text-muted"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
                <h3 className="mt-4 font-serif text-2xl font-semibold text-foreground">{item.name}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {item.shortDefinition ?? item.definition}
                </p>
              </Link>
            ) : (
              <Link
                key={item.title}
                href="/terms"
                className="rounded-[28px] border border-line bg-surface-soft p-6 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                    术语节点
                  </span>
                  <span className="rounded-full border border-line bg-white px-3 py-1 text-xs text-muted">
                    {item.category}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-2xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.definition}</p>
              </Link>
            ),
          )}
        </div>
        <div className="mt-6">
          <Link
            href="/terms"
            className="inline-flex rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            进入睡眠词库
          </Link>
        </div>
      </section>

      {/* ========== 第五部分：知识内容 / 行业趋势区 ========== */}
      <section className="portal-card rounded-[32px] border border-line bg-surface-soft p-8">
        <SectionHeading
          eyebrow="知识内容 / 行业趋势"
          title="用问题解释与趋势解读承接知识内容"
          description="知识区不做新闻流，而是用问题解释、趋势解读与延伸阅读的方式，把已发布 Content 组织成知识入口。"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {(knowledgeItems.length > 0 ? knowledgeItems : fallbackKnowledgeCards).map((item, index) =>
            "id" in item ? (
              <Link
                key={item.id}
                href={`/knowledge/${encodeSlug(item.slug)}`}
                className={`rounded-[28px] border p-6 transition hover:-translate-y-0.5 ${
                  index === 0
                    ? "border-[#BFDBFE] bg-white hover:border-[#60A5FA]"
                    : "border-line bg-white hover:border-brand"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">
                    {index === 0 ? "趋势解读" : "问题解释"}
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
                <h3 className="mt-4 font-serif text-2xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {item.summary ?? "当前内容已发布，但尚未补充摘要。"}
                </p>
                <p className="mt-5 text-sm text-muted">发布时间：{formatDate(item.publishedAt)}</p>
              </Link>
            ) : (
              <Link
                key={item.title}
                href="/knowledge"
                className={`rounded-[28px] border p-6 transition hover:-translate-y-0.5 ${
                  index === 0
                    ? "border-[#BFDBFE] bg-white hover:border-[#60A5FA]"
                    : "border-line bg-white hover:border-brand"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#1D4ED8]">
                    {item.badge}
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-2xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{item.summary}</p>
              </Link>
            ),
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/knowledge"
            className="inline-flex rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            进入睡眠知识
          </Link>
          <Link
            href="/trends"
            className="inline-flex rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            查看行业趋势
          </Link>
        </div>
      </section>

      {/* ========== 第六部分：品牌入口区 ========== */}
      <section className="portal-card rounded-[32px] border border-line bg-white p-8">
        <SectionHeading
          eyebrow="睡眠品牌入口"
          title="品牌、行业事件与品牌进展都从品牌体系进入"
          description="品牌区优先呈现行业名录、地区与主营方向，同时承接行业事件和品牌进展，不把品牌页做成资讯流。"
        />
        <div className="mt-8 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-4 md:grid-cols-2">
            {(brandItems.length > 0 ? brandItems : fallbackBrandCards).map((item) =>
              "id" in item ? (
                <Link
                  key={item.id}
                  href={`/brands/${encodeSlug(item.slug)}`}
                  className="rounded-[28px] border border-line bg-surface-soft p-6 transition hover:-translate-y-0.5 hover:border-brand"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                      品牌名录
                    </span>
                    {item.categories.slice(0, 1).map((category) => (
                      <span
                        key={category.slug}
                        className="rounded-full border border-line bg-white px-3 py-1 text-xs text-muted"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-4 font-serif text-2xl font-semibold text-foreground">{item.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {item.tagline ?? item.summary ?? "当前品牌尚未补充简介。"}
                  </p>
                  <div className="mt-5 space-y-2 text-sm text-muted">
                    <p>地区：{item.region ?? "待补充"}</p>
                    <p>城市：{item.city ?? "待补充"}</p>
                  </div>
                </Link>
              ) : (
                <Link
                  key={item.name}
                  href="/brands"
                  className="rounded-[28px] border border-line bg-surface-soft p-6 transition hover:-translate-y-0.5 hover:border-brand"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand">
                      品牌名录
                    </span>
                  </div>
                  <h3 className="mt-4 font-serif text-2xl font-semibold text-foreground">{item.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.summary}</p>
                  <div className="mt-5 space-y-2 text-sm text-muted">
                    <p>地区：{item.region}</p>
                    <p>城市：{item.city}</p>
                  </div>
                </Link>
              ),
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-line bg-surface-soft p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">行业事件</p>
              <h3 className="mt-3 font-serif text-2xl font-semibold text-foreground">
                事件归纳，而不是快讯堆叠
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                行业事件归入品牌体系，用来沉淀会议、展会、发布、合作与标准动作，服务行业参考，而不是做新闻流。
              </p>
              <div className="mt-5">
                <Link
                  href="/events"
                  className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
                >
                  进入行业事件
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-line bg-surface-soft p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">品牌进展</p>
              <h3 className="mt-3 font-serif text-2xl font-semibold text-foreground">
                结构更新，而不是企业新闻
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                品牌进展强调收录变化、地区扩展、主营方向与能力变化，帮助用户把品牌库当作行业名录与信任入口来看。
              </p>
              <div className="mt-5">
                <Link
                  href="/brand-progress"
                  className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
                >
                  进入品牌进展
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/brands"
            className="inline-flex rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            进入睡眠品牌
          </Link>
          <Link
            href="/events"
            className="inline-flex rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            查看行业事件
          </Link>
          <Link
            href="/brand-progress"
            className="inline-flex rounded-full border border-line bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
          >
            查看品牌进展
          </Link>
        </div>
      </section>

      {/* ========== 第七部分：信任体系区 ========== */}
      <section
        id="trust-system"
        className="portal-card rounded-[32px] border border-line bg-surface-soft p-8"
      >
        <SectionHeading
          eyebrow="信任体系入口"
          title="把行业参考能力直接立在首页中段"
          description="即使当前榜、指数、标准与智库还在逐步建设，入口结构也必须先成立，让首页明确体现中眠网的行业参考角色。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {trustCards.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-[28px] border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand">行业参考</p>
              <h3 className="mt-4 font-serif text-2xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ========== 第八部分：企业合作 / 品牌入驻区 ========== */}
      <section className="rounded-[32px] border border-[#FCD34D] bg-[#FFFBEB] p-8">
        <SectionHeading
          eyebrow="企业合作 / 品牌入驻"
          title="让 B 端用户看得见合作入口"
          description="首页直接告诉品牌、机构与合作方：中眠网不仅能展示内容，也能承接品牌收录、行业合作与参考体系共建。"
        />
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {businessCards.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="rounded-[28px] border border-[#FDE68A] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#F59E0B]"
            >
              <h3 className="font-serif text-2xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{item.summary}</p>
            </Link>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/cooperation"
            className="rounded-full bg-[#F59E0B] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#D97706]"
          >
            查看品牌收录入口
          </Link>
          <Link
            href="/cooperation"
            className="rounded-full border border-[#FCD34D] bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:border-[#F59E0B] hover:text-[#B45309]"
          >
            查看合作说明
          </Link>
        </div>
      </section>

      {/* ========== 第九部分：最新内容区 ========== */}
      <section className="rounded-[32px] border border-line/70 bg-[#F8FAFC] p-6">
        <SectionHeading
          eyebrow="最新内容"
          title="内容更新保留在首页后半段，不主导第一视觉"
          description="最新内容作为辅助信息存在，帮助首页保持更新感，但不再抢占知识入口、信任入口与商业入口的优先级。"
        />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {(latestKnowledgeItems.length > 0
            ? latestKnowledgeItems
            : fallbackKnowledgeCards.slice(0, 3)
          ).map((item, index) =>
            "id" in item ? (
              <Link
                key={item.id}
                href={`/knowledge/${encodeSlug(item.slug)}`}
                className="rounded-[24px] border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-slate-500">0{index + 1}</span>
                  <div className="space-y-3">
                    <h3 className="font-serif text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm leading-7 text-muted">
                      {item.summary ?? "当前内容已发布，但尚未补充摘要。"}
                    </p>
                    <p className="text-sm text-muted">发布时间：{formatDate(item.publishedAt)}</p>
                  </div>
                </div>
              </Link>
            ) : (
              <Link
                key={item.title}
                href="/knowledge"
                className="rounded-[24px] border border-line bg-white p-5 transition hover:-translate-y-0.5 hover:border-brand"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-slate-500">0{index + 1}</span>
                  <div className="space-y-3">
                    <h3 className="font-serif text-xl font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm leading-7 text-muted">{item.summary}</p>
                    <p className="text-sm text-muted">{item.badge}</p>
                  </div>
                </div>
              </Link>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
