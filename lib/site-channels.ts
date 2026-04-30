/**
 * 文件说明：该文件定义中眠网前台扩展栏目与后台扩展频道的统一配置。
 * 功能说明：集中维护频道路径、标题、内容类型、后台入口、SEO 文案与公开详情路径映射，避免前台、后台、sitemap、AI 模板各自维护一套规则。
 *
 * 结构概览：
 *   第一部分：频道键与配置类型
 *   第二部分：站点频道配置
 *   第三部分：频道路径与内容映射工具
 */

import type { ContentType, SiteChannelKey } from "@prisma/client";

export type ReservedChannelSlug =
  | "trends"
  | "events"
  | "brand-progress"
  | "rankings"
  | "indexes"
  | "standards"
  | "think-tank"
  | "cooperation";

export type ManagedContentChannelSlug = Exclude<ReservedChannelSlug, "cooperation">;

export type ChannelListTone = "knowledge" | "events" | "brand" | "reference";

export type SiteChannelConfig = {
  slug: ReservedChannelSlug;
  channelKey?: SiteChannelKey;
  title: string;
  shortTitle: string;
  navLabel: string;
  path: `/${ReservedChannelSlug}`;
  adminPath?: `/admin/${ManagedContentChannelSlug}`;
  adminNewPath?: `/admin/${ManagedContentChannelSlug}/new`;
  detailPrefix?: `/${ManagedContentChannelSlug}`;
  description: string;
  purpose: string;
  listEyebrow: string;
  listTitle: string;
  listDescription: string;
  itemEyebrow: string;
  emptyDescription: string;
  collaborationTitle?: string;
  collaborationDescription?: string;
  seoKeywords: string[];
  defaultContentType?: ContentType;
  allowedContentTypes: ContentType[];
  tone: ChannelListTone;
  requiresEventMeta?: boolean;
  requiresReferenceVersion?: boolean;
};

export const siteChannelConfigs: Record<ReservedChannelSlug, SiteChannelConfig> = {
  trends: {
    slug: "trends",
    channelKey: "TRENDS",
    title: "行业趋势",
    shortTitle: "趋势",
    navLabel: "行业趋势",
    path: "/trends",
    adminPath: "/admin/trends",
    adminNewPath: "/admin/trends/new",
    detailPrefix: "/trends",
    description: "睡眠产业趋势、行业变化与数据观察的解释入口。",
    purpose:
      "用于沉淀睡眠产业的长期变化、方法演进、消费趋势和服务结构变化，帮助用户建立稳定的行业趋势判断，而不是浏览碎片快讯。",
    listEyebrow: "趋势解释入口",
    listTitle: "从趋势解读进入睡眠产业变化脉络",
    listDescription:
      "行业趋势页优先组织长期变化、数据观察和结构判断，避免退回普通新闻流。",
    itemEyebrow: "趋势解读",
    emptyDescription:
      "该栏目正在建设中，后续将持续更新睡眠产业趋势、数据观察与结构判断内容。",
    seoKeywords: ["行业趋势", "睡眠产业趋势", "睡眠行业观察", "趋势解读"],
    defaultContentType: "REPORT",
    allowedContentTypes: ["ARTICLE", "REPORT", "GUIDE", "THINK_TANK"],
    tone: "knowledge",
  },
  events: {
    slug: "events",
    channelKey: "EVENTS",
    title: "行业事件",
    shortTitle: "事件",
    navLabel: "行业事件",
    path: "/events",
    adminPath: "/admin/events",
    adminNewPath: "/admin/events/new",
    detailPrefix: "/events",
    description: "睡眠行业展会、论坛、发布会与年度事件的结构化入口。",
    purpose:
      "用于归纳睡眠行业中的重要会议、展会、论坛、发布会和合作事件，帮助用户按结构理解行业节奏，而不是浏览普通展会新闻流。",
    listEyebrow: "事件归纳入口",
    listTitle: "从结构化事件入口理解行业节奏",
    listDescription:
      "行业事件页强调时间、地点、类型和正文信息，承接展会、论坛、发布会与年度节点。",
    itemEyebrow: "行业事件",
    emptyDescription:
      "该栏目正在建设中，后续将持续更新睡眠行业展会、论坛、发布会与年度事件内容。",
    seoKeywords: ["行业事件", "睡眠展会", "睡眠论坛", "睡眠发布会"],
    defaultContentType: "ARTICLE",
    allowedContentTypes: ["ARTICLE", "TOPIC", "REPORT"],
    tone: "events",
    requiresEventMeta: true,
  },
  "brand-progress": {
    slug: "brand-progress",
    channelKey: "BRAND_PROGRESS",
    title: "品牌进展",
    shortTitle: "进展",
    navLabel: "品牌进展",
    path: "/brand-progress",
    adminPath: "/admin/brand-progress",
    adminNewPath: "/admin/brand-progress/new",
    detailPrefix: "/brand-progress",
    description: "品牌能力变化、产品方向与企业进展的结构化观察入口。",
    purpose:
      "用于沉淀品牌收录变化、主营方向调整、区域扩展与能力演进，帮助用户把品牌信息当作行业名录和信任参考来理解。",
    listEyebrow: "结构更新入口",
    listTitle: "从品牌进展进入企业能力变化观察",
    listDescription:
      "品牌进展页强调与品牌主体的关联关系，避免退回企业新闻流。",
    itemEyebrow: "品牌进展",
    emptyDescription:
      "该栏目正在建设中，后续将持续更新品牌能力变化、产品方向与企业进展内容。",
    seoKeywords: ["品牌进展", "品牌更新", "企业进展", "睡眠品牌观察"],
    defaultContentType: "ARTICLE",
    allowedContentTypes: ["ARTICLE", "REPORT", "THINK_TANK"],
    tone: "brand",
  },
  rankings: {
    slug: "rankings",
    channelKey: "RANKINGS",
    title: "中眠榜",
    shortTitle: "榜单",
    navLabel: "中眠榜",
    path: "/rankings",
    adminPath: "/admin/rankings",
    adminNewPath: "/admin/rankings/new",
    detailPrefix: "/rankings",
    description: "睡眠品牌、产品与服务的行业参考榜单入口。",
    purpose:
      "用于承接睡眠品牌、产品、服务与机构的参考榜单能力，帮助用户从行业视角建立对代表性样本和优先级的判断。",
    listEyebrow: "榜单参考入口",
    listTitle: "从榜单入口进入行业参考体系",
    listDescription:
      "中眠榜页以榜单说明、评估维度、入榜对象和发布时间为核心结构，不退回内容流表达。",
    itemEyebrow: "行业榜单",
    emptyDescription:
      "该栏目正在建设中，后续将持续更新睡眠品牌、产品与服务的参考榜单内容。",
    seoKeywords: ["中眠榜", "睡眠榜单", "品牌榜", "行业榜单"],
    defaultContentType: "RANKING",
    allowedContentTypes: ["RANKING"],
    tone: "reference",
  },
  indexes: {
    slug: "indexes",
    channelKey: "INDEXES",
    title: "中眠指数",
    shortTitle: "指数",
    navLabel: "中眠指数",
    path: "/indexes",
    adminPath: "/admin/indexes",
    adminNewPath: "/admin/indexes/new",
    detailPrefix: "/indexes",
    description: "睡眠消费、睡眠关注度与城市睡眠等数据指数入口。",
    purpose:
      "用于承接与睡眠消费、睡眠关注度、城市睡眠、职业睡眠相关的数据指数与观察能力，帮助平台建立数据化行业参考入口。",
    listEyebrow: "指数参考入口",
    listTitle: "从数据指数进入行业信号观察",
    listDescription:
      "指数页以指数名称、摘要、数据说明和结构化正文为主，不强依赖复杂图表也能清楚表达。",
    itemEyebrow: "行业指数",
    emptyDescription:
      "该栏目正在建设中，后续将持续更新睡眠消费、关注度和城市睡眠等数据指数内容。",
    seoKeywords: ["中眠指数", "睡眠指数", "消费指数", "城市睡眠"],
    defaultContentType: "INDEX",
    allowedContentTypes: ["INDEX"],
    tone: "reference",
  },
  standards: {
    slug: "standards",
    channelKey: "STANDARDS",
    title: "睡眠标准",
    shortTitle: "标准",
    navLabel: "睡眠标准",
    path: "/standards",
    adminPath: "/admin/standards",
    adminNewPath: "/admin/standards/new",
    detailPrefix: "/standards",
    description: "睡眠产品、服务、环境与术语标准的行业参考入口。",
    purpose:
      "用于承接与睡眠产品、服务流程、睡眠环境和术语规范相关的标准参考内容，帮助用户建立更专业的行业判断边界。",
    listEyebrow: "标准参考入口",
    listTitle: "从标准入口进入专业参考体系",
    listDescription:
      "标准页强调适用范围、核心条目、版本信息和专业表达，不做普通文章页。",
    itemEyebrow: "标准参考",
    emptyDescription:
      "该栏目正在建设中，后续将持续更新睡眠产品、服务、环境与术语标准内容。",
    seoKeywords: ["睡眠标准", "术语标准", "服务标准", "环境标准"],
    defaultContentType: "STANDARD",
    allowedContentTypes: ["STANDARD"],
    tone: "reference",
    requiresReferenceVersion: true,
  },
  "think-tank": {
    slug: "think-tank",
    channelKey: "THINK_TANK",
    title: "中眠智库",
    shortTitle: "智库",
    navLabel: "中眠智库",
    path: "/think-tank",
    adminPath: "/admin/think-tank",
    adminNewPath: "/admin/think-tank/new",
    detailPrefix: "/think-tank",
    description: "睡眠产业研究、白皮书、趋势报告与专家观点入口。",
    purpose:
      "用于承接睡眠产业研究、白皮书、趋势报告、专题判断和专家观点，形成高于榜单、指数、标准之上的行业参考入口。",
    listEyebrow: "智库参考入口",
    listTitle: "从研究、白皮书与报告进入中眠智库",
    listDescription:
      "智库页优先呈现研究、报告、观察和白皮书，不退回资讯站表达。",
    itemEyebrow: "智库内容",
    emptyDescription:
      "该栏目正在建设中，后续将持续更新睡眠产业研究、白皮书、趋势报告与专家观点内容。",
    seoKeywords: ["中眠智库", "行业参考", "趋势报告", "白皮书"],
    defaultContentType: "THINK_TANK",
    allowedContentTypes: ["THINK_TANK", "REPORT", "ARTICLE"],
    tone: "reference",
  },
  cooperation: {
    slug: "cooperation",
    title: "企业合作 / 品牌入驻",
    shortTitle: "合作",
    navLabel: "企业合作",
    path: "/cooperation",
    description: "品牌入驻、企业收录、榜单指数智库合作入口。",
    purpose:
      "用于向品牌、机构与合作方说明中眠网可承接的品牌收录、品牌展示、榜单合作、指数合作、智库合作与内容增信服务能力。",
    listEyebrow: "合作承接入口",
    listTitle: "让品牌、机构与合作方看得见合作方式",
    listDescription:
      "合作页不做复杂表单，而是优先清楚说明中眠网可提供的合作方向、适配对象和联系入口。",
    itemEyebrow: "合作说明",
    emptyDescription:
      "该栏目正在建设中，后续将持续完善品牌入驻、企业收录与榜单指数智库合作说明。",
    seoKeywords: ["品牌收录", "行业合作", "品牌入驻", "智库合作"],
    allowedContentTypes: [],
    tone: "reference",
    collaborationTitle: "可承接的合作方向",
    collaborationDescription:
      "品牌收录、品牌展示、榜单合作、指数合作、智库合作与内容增信均可通过该页面进行合作说明与线索承接。",
  },
};

export const managedContentChannelConfigs = Object.values(siteChannelConfigs).filter(
  (item): item is SiteChannelConfig & {
    channelKey: SiteChannelKey;
    adminPath: `/admin/${ManagedContentChannelSlug}`;
    adminNewPath: `/admin/${ManagedContentChannelSlug}/new`;
    detailPrefix: `/${ManagedContentChannelSlug}`;
    defaultContentType: ContentType;
  } => item.slug !== "cooperation",
);

export function getManagedChannelBySlug(slug: string) {
  return managedContentChannelConfigs.find((item) => item.slug === slug) ?? null;
}

export function getManagedChannelByKey(channelKey: SiteChannelKey) {
  return (
    managedContentChannelConfigs.find((item) => item.channelKey === channelKey) ??
    null
  );
}

export function getSiteChannelConfig(slug: string) {
  return siteChannelConfigs[slug as ReservedChannelSlug] ?? null;
}

export function getContentPublicPath(params: {
  slug: string;
  channelKey?: SiteChannelKey | null;
}) {
  if (!params.slug) {
    return null;
  }

  if (!params.channelKey || params.channelKey === "KNOWLEDGE") {
    return `/knowledge/${params.slug}`;
  }

  const matchedChannel = getManagedChannelByKey(params.channelKey);

  return matchedChannel ? `${matchedChannel.detailPrefix}/${params.slug}` : `/knowledge/${params.slug}`;
}
