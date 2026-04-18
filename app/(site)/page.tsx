/**
 * 文件说明：该文件实现中眠网首页的行业入口结构重构版。
 * 功能说明：显性呈现基础知识入口、信任入口、商业入口三层能力，避免首页继续偏向资讯站表达。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：首页结构重构实现
 */

import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildPageMetadata } from "@/lib/seo";
import {
  businessEntryCards,
  contentFlowSections,
  heroCapabilityPanels,
  homeEntranceLanes,
  knowledgeEntryGroups,
  platformEntryCards,
  trustEntryCards,
} from "@/lib/demo-data";

export const metadata: Metadata = buildPageMetadata({
  title: "中国睡眠产业知识入口与行业参考平台",
  description:
    "覆盖睡眠知识、品牌、榜单、指数与标准体系，服务中国睡眠产业的知识入口、信任入口与商业入口。",
  path: "/",
  keywords: ["睡眠知识", "睡眠品牌", "睡眠产业", "睡眠标准", "中眠榜"],
});

export default function HomePage() {
  const platformEntryGroups = [
    {
      key: "知识入口",
      title: "睡眠知识入口",
      description: "先把词库与知识路径放到第一屏主导位置，让用户先看见如何进入知识基础设施。",
    },
    {
      key: "行业参考入口",
      title: "行业参考入口",
      description: "把榜单、指数、标准、智库并列成入口组，不再让它们看起来像后续内容块。",
    },
    {
      key: "品牌与产业入口",
      title: "品牌与产业入口",
      description: "让品牌名录与产业合作入口在第一屏就成立，而不是放到后面顺带提一嘴。",
    },
  ].map((group) => ({
    ...group,
    items: platformEntryCards.filter((item) => item.group === group.key),
  }));

  return (
    <div className="portal-shell space-y-12">
      {/* ========== 第一部分：平台定位 + 核心总入口 ========== */}
      <section className="relative overflow-hidden rounded-[36px] border border-slate-700 bg-[#0F172A] p-8 text-white shadow-[0_34px_80px_rgba(15,23,42,0.34)] sm:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-14 top-0 h-44 w-44 rounded-full bg-[#3B82F6]/18 blur-3xl" />
          <div className="absolute right-0 top-12 h-56 w-56 rounded-full bg-[#60A5FA]/12 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-[#F59E0B]/12 blur-3xl" />
        </div>
        <div className="relative grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-white/14 bg-white/8 px-4 py-2 text-sm font-medium text-[#FCD34D]">
              首页强化版：前两屏直接压住行业入口表达
            </span>
            <div className="space-y-5">
              <h1 className="max-w-4xl font-serif text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                中国睡眠产业的知识入口、行业参考入口、品牌入口与服务入口
              </h1>
              <p className="max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                这一版首页不再先讲推荐内容，而是先讲用户进入中眠网后最先要做什么：
                查睡眠知识、看行业参考、找品牌与产业主体。
              </p>
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

          <div className="grid gap-4">
            {heroCapabilityPanels.map((item) => (
              <article
                key={item.title}
                className="rounded-[28px] border border-white/12 bg-[#1E293B] p-6 text-white shadow-[0_18px_35px_rgba(15,23,42,0.2)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#93C5FD]">
                  入口判断
                </p>
                <h2 className="mt-3 font-serif text-2xl font-semibold">{item.title}</h2>
                <p className="mt-4 text-sm leading-7 text-white/82">{item.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.points.map((point) => (
                    <span
                      key={point}
                      className="rounded-full border border-[#60A5FA]/28 bg-[#3B82F6]/10 px-3 py-1 text-xs text-[#DBEAFE]"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#93C5FD]">
                核心总入口
              </p>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-white">
                七个行业入口必须像入口，而不是像内容块
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-300">
              第一屏直接按“知识入口 / 行业参考入口 / 品牌与产业入口”分组，让词库、榜单、指数、品牌在视觉和语义上都先成立。
            </p>
          </div>

          <div className="portal-grid xl:grid-cols-[1.15fr_1fr_0.95fr]">
            {platformEntryGroups.map((group, index) => (
              <section
                key={group.key}
                className={`rounded-[30px] border p-6 ${
                  index === 0
                    ? "border-[#60A5FA]/26 bg-white/10"
                    : "border-white/12 bg-[#1E293B]/92"
                }`}
              >
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#93C5FD]">
                    {group.title}
                  </p>
                  <h3 className="font-serif text-2xl font-semibold text-white">
                    {group.description}
                  </h3>
                </div>
                <div className="mt-6 space-y-4">
                  {group.items.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="block rounded-[24px] border border-slate-200 bg-white p-5 text-[#0F172A] transition hover:-translate-y-0.5 hover:border-[#3B82F6]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                          <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#1D4ED8]">
                            {item.badge}
                          </span>
                          <h4 className="font-serif text-2xl font-semibold text-[#0F172A]">
                            {item.title}
                          </h4>
                        </div>
                        <span className="rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#92400E]">
                          入口
                        </span>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-slate-600">{item.summary}</p>
                      <p className="mt-5 text-sm font-medium text-[#1D4ED8]">{item.action}</p>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 第二部分：前两屏入口地图 ========== */}
      <section id="knowledge-entry" className="portal-card rounded-[32px] border border-line bg-white p-8">
        <SectionHeading
          eyebrow="前两屏入口地图"
          title="第二屏继续把三条主入口压实，而不是退回内容块组织"
          description="这里继续明确三条入口各自解决什么问题、承接哪些模块、应该从哪里开始，确保前两屏就能把行业入口感压住。"
        />
        <div className="mt-8 portal-grid xl:grid-cols-[1.15fr_0.95fr_0.95fr]">
          {homeEntranceLanes.map((lane, index) => (
            <article
              key={lane.title}
              className={`rounded-[30px] border p-6 ${
                index === 0
                  ? "border-[#1E40AF]/24 bg-[#EFF6FF] text-[#0F172A]"
                  : "border-line bg-surface-soft"
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.28em] ${
                  index === 0 ? "text-[#2563EB]" : "text-brand"
                }`}
              >
                {lane.eyebrow}
              </p>
              <h3
                className={`mt-3 font-serif text-3xl font-semibold ${
                  index === 0 ? "text-[#0F172A]" : "text-foreground"
                }`}
              >
                {lane.title}
              </h3>
              <p
                className={`mt-4 text-sm leading-7 ${
                  index === 0 ? "text-slate-600" : "text-muted"
                }`}
              >
                {lane.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {lane.highlight.map((item) => (
                  <span
                    key={item}
                    className={`rounded-full px-3 py-1 text-xs ${
                      index === 0
                        ? "border border-[#93C5FD] bg-white text-[#1D4ED8]"
                        : "border border-line bg-white text-foreground/82"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {lane.entries.map((item) => (
                  <div
                    key={item}
                    className={`rounded-[22px] border px-4 py-4 text-sm leading-7 ${
                      index === 0
                        ? "border-[#BFDBFE] bg-white text-[#0F172A]"
                        : "border-line bg-white text-foreground"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 portal-grid lg:grid-cols-2">
          {knowledgeEntryGroups.map((group, index) => (
            <article
              key={group.title}
              className={`rounded-[28px] border p-6 ${
                index === 1
                  ? "border-[#93C5FD] bg-[#F8FBFF] shadow-[0_14px_30px_rgba(59,130,246,0.08)]"
                  : "border-line bg-surface-soft"
              }`}
            >
              <h3 className="font-serif text-2xl font-semibold text-foreground">
                {group.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">{group.description}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className={`rounded-full px-4 py-2 text-sm ${
                      index === 1
                        ? "border border-[#BFDBFE] bg-white text-[#1D4ED8]"
                        : "border border-line bg-white text-foreground/82"
                    }`}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ========== 第三部分：信任入口 ========== */}
      <section id="trust-entry" className="portal-card rounded-[32px] border border-line bg-surface-soft p-8">
        <SectionHeading
          eyebrow="信任入口"
          title="让首页直接建立行业参考体系，而不是继续像内容站"
          description="品牌、榜单、指数、标准、智库这五个模块即使数据不多，也要先把行业参考结构搭起来。"
        />
        <div className="mt-8 portal-grid lg:grid-cols-[1.18fr_0.82fr]">
          <div className="rounded-[28px] border border-line bg-white p-6">
            <h3 className="font-serif text-2xl font-semibold text-foreground">
              信任体系的核心不是内容量，而是结构先成立
            </h3>
            <div className="mt-6 portal-grid sm:grid-cols-2">
              {trustEntryCards.map((item) => (
                <article key={item.title} className="rounded-[24px] border border-line bg-surface-soft p-5">
                  <span className="rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-semibold text-[#1D4ED8]">
                    {item.signal}
                  </span>
                  <h4 className="mt-4 text-lg font-semibold text-foreground">
                    {item.title}
                  </h4>
                  <p className="mt-3 text-sm leading-7 text-muted">{item.summary}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-[#F8FAFC] p-6">
            <h3 className="font-serif text-2xl font-semibold text-[#0F172A]">行业参考体系</h3>
            <div className="mt-6 space-y-3">
              {[
                "品牌展示：建立行业主体的基础认知",
                "中眠榜：形成可参考的排序结构",
                "中眠指数：形成数据与趋势视角",
                "睡眠标准：形成规范与专业边界",
                "中眠智库：形成行业判断与研究支撑",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[20px] border border-line bg-white px-4 py-4 text-sm leading-7 text-slate-600"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== 第四部分：商业入口 ========== */}
      <section id="service-entry" className="portal-card rounded-[32px] border border-line bg-white p-8">
        <SectionHeading
          eyebrow="商业入口"
          title="一期就把企业合作和行业服务入口显性放出来"
          description="这一层不是未来想法，而是平台定位的一部分：企业、机构和合作方要知道中眠网不仅能展示内容，也能承接合作。"
        />
        <div className="mt-8 portal-grid lg:grid-cols-4">
          {businessEntryCards.map((item, index) => (
            <article
              key={item.title}
              className={`rounded-[28px] border p-6 ${
                index === 0
                  ? "border-[#FCD34D] bg-[#FFFBEB]"
                  : "border-line bg-surface-soft"
              }`}
            >
              <h3 className="font-serif text-2xl font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-muted">{item.summary}</p>
              <span className="mt-6 inline-flex rounded-full bg-[#DBEAFE] px-3 py-1 text-xs font-medium text-[#1D4ED8]">
                企业合作结构已显性建立
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* ========== 第五部分：内容流降权 ========== */}
      <section className="rounded-[32px] border border-line/70 bg-[#F8FAFC] p-6">
        <SectionHeading
          eyebrow="内容流"
          title="内容更新保留存在感，但进一步降到辅助层"
          description="文章、推荐和更新信息只作为辅助信号出现，不再与首页入口结构争夺主导权。"
        />
        <div className="mt-6 portal-grid lg:grid-cols-2">
          {contentFlowSections.map((section) => (
            <div key={section.title} className="rounded-[24px] border border-line bg-white p-5">
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {section.title}
              </h3>
              <div className="mt-4 space-y-2">
                {section.items.map((item, index) => (
                  <div key={item} className="flex gap-3 rounded-[20px] border border-line/80 bg-surface-soft px-4 py-3">
                    <span className="text-xs font-semibold text-slate-500">0{index + 1}</span>
                    <p className="text-sm leading-7 text-foreground/88">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
