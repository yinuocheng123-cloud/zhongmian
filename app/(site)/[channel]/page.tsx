/**
 * 文件说明：该文件实现首页补齐所需的栏目级最小落地页。
 * 功能说明：为行业趋势、行业事件、品牌进展、中眠榜、中眠指数、睡眠标准、中眠智库与合作入口提供可访问的专业栏目页，避免首页入口 404。
 *
 * 结构概览：
 *   第一部分：导入依赖与栏目配置
 *   第二部分：metadata 与静态参数
 *   第三部分：栏目页实现
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildPageMetadata } from "@/lib/seo";

const channelConfigs = {
  trends: {
    title: "行业趋势",
    eyebrow: "趋势解释入口",
    description: "睡眠产业趋势、行业变化与数据观察的解释入口。",
    purpose:
      "该栏目用于解释睡眠产业中的长期变化、方法演进、消费趋势与服务结构变化，帮助用户建立对行业趋势的稳定理解，而不是阅读碎片快讯。",
    relatedLinks: [
      { label: "进入睡眠知识", href: "/knowledge" },
      { label: "查看睡眠词库", href: "/terms" },
      { label: "查看中眠智库", href: "/think-tank" },
    ],
    path: "/trends",
    keywords: ["行业趋势", "睡眠趋势", "产业变化", "睡眠行业观察"],
  },
  events: {
    title: "行业事件",
    eyebrow: "事件归纳入口",
    description: "睡眠行业展会、论坛、发布会与年度事件的结构化入口。",
    purpose:
      "该栏目用于归纳睡眠行业中的重要会议、展会、论坛、品牌发布与合作事件，帮助用户按结构理解行业节奏，而不是浏览普通新闻流。",
    relatedLinks: [
      { label: "进入睡眠品牌", href: "/brands" },
      { label: "查看品牌进展", href: "/brand-progress" },
      { label: "查看中眠榜", href: "/rankings" },
    ],
    path: "/events",
    keywords: ["行业事件", "睡眠展会", "睡眠论坛", "行业发布会"],
  },
  "brand-progress": {
    title: "品牌进展",
    eyebrow: "结构更新入口",
    description: "品牌能力变化、产品方向与企业进展的结构化观察入口。",
    purpose:
      "该栏目用于持续沉淀品牌收录变化、主营方向调整、地区扩展与能力演进，帮助用户把品牌信息当作行业名录和信任参考来理解。",
    relatedLinks: [
      { label: "进入睡眠品牌", href: "/brands" },
      { label: "查看行业事件", href: "/events" },
      { label: "查看企业合作入口", href: "/cooperation" },
    ],
    path: "/brand-progress",
    keywords: ["品牌进展", "品牌更新", "企业进展", "睡眠品牌观察"],
  },
  rankings: {
    title: "中眠榜",
    eyebrow: "榜单参考入口",
    description: "睡眠品牌、产品与服务的行业参考榜单入口。",
    purpose:
      "该栏目用于承接睡眠品牌、产品、服务与机构的参考榜单能力，帮助用户从行业视角建立对优先级和代表性样本的判断。",
    relatedLinks: [
      { label: "进入睡眠品牌", href: "/brands" },
      { label: "查看中眠指数", href: "/indexes" },
      { label: "查看中眠智库", href: "/think-tank" },
    ],
    path: "/rankings",
    keywords: ["中眠榜", "睡眠榜单", "品牌榜", "行业榜单"],
  },
  indexes: {
    title: "中眠指数",
    eyebrow: "指数参考入口",
    description: "睡眠消费、睡眠关注度与城市睡眠等数据指数入口。",
    purpose:
      "该栏目用于承接与睡眠消费、睡眠关注度、城市睡眠、场景变化相关的数据指数与观察能力，帮助平台建立数据化行业参考入口。",
    relatedLinks: [
      { label: "查看中眠榜", href: "/rankings" },
      { label: "查看行业趋势", href: "/trends" },
      { label: "查看中眠智库", href: "/think-tank" },
    ],
    path: "/indexes",
    keywords: ["中眠指数", "睡眠指数", "消费指数", "城市睡眠"],
  },
  standards: {
    title: "睡眠标准",
    eyebrow: "标准参考入口",
    description: "睡眠产品、服务、环境与术语标准的行业参考入口。",
    purpose:
      "该栏目用于承接与睡眠产品、服务流程、睡眠环境、术语规范相关的标准化参考内容，帮助用户建立更专业的行业判断边界。",
    relatedLinks: [
      { label: "查看睡眠词库", href: "/terms" },
      { label: "查看中眠智库", href: "/think-tank" },
      { label: "查看行业事件", href: "/events" },
    ],
    path: "/standards",
    keywords: ["睡眠标准", "术语标准", "服务标准", "环境标准"],
  },
  "think-tank": {
    title: "中眠智库 / 行业参考",
    eyebrow: "智库参考入口",
    description: "睡眠产业研究、白皮书、趋势报告与专家观点入口。",
    purpose:
      "该栏目用于承接睡眠产业研究、白皮书、趋势报告、专题判断与专家观点，形成对榜单、指数、标准之上的更高层行业参考入口。",
    relatedLinks: [
      { label: "查看中眠榜", href: "/rankings" },
      { label: "查看中眠指数", href: "/indexes" },
      { label: "查看睡眠标准", href: "/standards" },
    ],
    path: "/think-tank",
    keywords: ["中眠智库", "行业参考", "趋势报告", "白皮书"],
  },
  cooperation: {
    title: "企业合作 / 品牌收录",
    eyebrow: "合作承接入口",
    description: "品牌入驻、企业收录、榜单指数智库合作入口。",
    purpose:
      "该栏目用于向品牌、机构与合作方说明中眠网可承接的品牌收录、行业合作、榜单合作、指数合作与智库合作方向，帮助 B 端用户快速理解参与方式。",
    relatedLinks: [
      { label: "进入睡眠品牌", href: "/brands" },
      { label: "查看中眠榜", href: "/rankings" },
      { label: "查看中眠智库", href: "/think-tank" },
    ],
    path: "/cooperation",
    keywords: ["品牌收录", "行业合作", "品牌入驻", "智库合作"],
  },
} as const;

type ChannelKey = keyof typeof channelConfigs;

type PageProps = {
  params: Promise<{
    channel: string;
  }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(channelConfigs).map((channel) => ({ channel }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { channel } = await params;
  const config = channelConfigs[channel as ChannelKey];

  if (!config) {
    return buildPageMetadata({
      title: "栏目不存在",
      description: "当前栏目不存在或尚未开放。",
      path: "/",
      noIndex: true,
    });
  }

  return buildPageMetadata({
    title: config.title,
    description: config.description,
    path: config.path,
    keywords: [...config.keywords],
  });
}

export default async function ChannelPage({ params }: PageProps) {
  const { channel } = await params;
  const config = channelConfigs[channel as ChannelKey];

  if (!config) {
    notFound();
  }

  return (
    <div className="portal-shell space-y-8">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <SectionHeading
          eyebrow={config.eyebrow}
          title={config.title}
          description={config.description}
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[28px] border border-line bg-surface-soft p-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground">这个栏目解决什么问题</h2>
            <p className="mt-4 text-sm leading-8 text-muted">{config.purpose}</p>
          </div>

          <div className="rounded-[28px] border border-line bg-white p-6">
            <h2 className="font-serif text-2xl font-semibold text-foreground">当前可进入的相关栏目推荐</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {config.relatedLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-line bg-surface-soft px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="portal-card rounded-[32px] border border-line bg-surface-soft p-8">
        <SectionHeading
          eyebrow="栏目建设说明"
          title="该栏目正在建设中，后续将持续更新睡眠产业相关内容。"
          description="当前页面先提供明确定位、用途说明与相关栏目推荐，确保首页入口均可稳定进入，并保持专业、清晰、可信的交付状态。"
        />
      </section>
    </div>
  );
}
