/**
 * 文件说明：该文件提供中眠网 demo 骨架所需的静态演示数据。
 * 功能说明：集中维护前台门户、频道列表与后台骨架展示数据，避免页面层分散写死。
 *
 * 结构概览：
 *   第一部分：前台导航与首页演示数据
 *   第二部分：频道页演示数据
 *   第三部分：后台演示数据
 */

export const siteNav = [
  { label: "首页", href: "/" },
  { label: "睡眠词库", href: "/terms" },
  { label: "睡眠知识", href: "/knowledge" },
  { label: "睡眠品牌", href: "/brands" },
  { label: "关于我们", href: "/about" },
] as const;

export const reservedChannels = [
  "中眠榜",
  "中眠指数",
  "睡眠标准",
  "中眠智库",
  "企业合作",
] as const;

export const homeQuickLinks = [
  {
    title: "睡眠词库",
    summary: "覆盖概念定义、行业术语、治疗路径与设备术语，承担长尾入口。",
    href: "/terms",
    meta: "知识基础设施",
  },
  {
    title: "睡眠知识",
    summary: "聚合人群问题、科学解释、专题指南与内容栏目，形成教育入口。",
    href: "/knowledge",
    meta: "内容与问答",
  },
  {
    title: "睡眠品牌",
    summary: "沉淀企业与品牌信息，为后续会员入驻、合作线索和商业展示打底。",
    href: "/brands",
    meta: "信任与商业入口",
  },
] as const;

export const homeQuestions = [
  "失眠到底是症状、疾病还是长期生活方式问题？",
  "打鼾和阻塞性睡眠呼吸暂停有什么区别？",
  "褪黑素、助眠仪和睡眠监测设备分别适合什么场景？",
  "成年人、儿童、老人对睡眠环境的关注点有哪些差异？",
  "品牌、医院、研究机构和渠道商在睡眠产业链里如何分工？",
] as const;

export const recommendedKnowledge = [
  {
    title: "睡眠产业图谱：从诊疗、产品到服务的一级结构",
    tag: "专题导航",
    summary: "用一张结构图说明中眠网未来内容、品牌、标准与指数体系的承接关系。",
  },
  {
    title: "睡眠监测设备入门：家用、医疗级与消费级的差别",
    tag: "知识卡",
    summary: "聚焦用户最常见的设备认知误区，适合首页推荐与搜索长尾入口。",
  },
  {
    title: "睡眠环境治理指南：床垫、灯光、温湿度与噪声",
    tag: "方法论",
    summary: "兼顾资讯感与知识感，体现门户首页的内容密度和实用价值。",
  },
] as const;

export const recommendedBrands = [
  {
    name: "眠域科技",
    focus: "睡眠监测 / 数据服务",
    city: "上海",
    trust: "已预留企业入驻能力",
  },
  {
    name: "深眠研究院",
    focus: "科普内容 / 人群研究",
    city: "北京",
    trust: "可承接智库与专题栏目",
  },
  {
    name: "舒睡空间",
    focus: "床垫 / 家居场景",
    city: "深圳",
    trust: "适合后续榜单与品牌露出",
  },
] as const;

export const latestFeed = [
  {
    section: "快讯",
    title: "中眠网一期将以词库、知识库、品牌库作为三条主线搭建内容底座",
    time: "今日更新",
  },
  {
    section: "问题",
    title: "睡眠呼吸暂停相关品牌与知识内容将优先形成专题聚合能力",
    time: "1 小时前",
  },
  {
    section: "规划",
    title: "榜单、指数、标准、智库频道保留入口，先不进入正式业务实现",
    time: "4 小时前",
  },
] as const;

export const portalSignals = [
  { label: "门户首页", value: "高信息密度" },
  { label: "知识基础设施", value: "词条 + 知识双库" },
  { label: "商业承接", value: "品牌展示 + 会员预留" },
  { label: "AI 编辑部", value: "轻量流程 demo" },
] as const;

export const termEntries = [
  {
    title: "睡眠呼吸暂停",
    group: "疾病与诊断",
    definition: "用于演示词条页的结构化卡片：定义、别名、关联问题和延伸阅读入口。",
  },
  {
    title: "睡眠监测",
    group: "设备与服务",
    definition: "承担未来 SEO 长尾入口，适合沉淀概念解释、设备分类和场景说明。",
  },
  {
    title: "睡眠卫生",
    group: "生活方式",
    definition: "体现知识型门户的实用属性，后续可与知识库和专题页互相打通。",
  },
  {
    title: "昼夜节律",
    group: "基础科学",
    definition: "适合连接知识普及内容与更专业的研究、标准、智库栏目。",
  },
] as const;

export const knowledgeEntries = [
  {
    title: "为什么垂直门户不能只做资讯流",
    type: "编辑视角",
    summary: "这一页展示知识栏目既有资讯感也有知识库感，而不是单纯文章列表。",
  },
  {
    title: "不同人群的睡眠问题入口如何组织",
    type: "人群专题",
    summary: "后续可以延展为儿童、老人、职场人、女性等内容矩阵。",
  },
  {
    title: "品牌内容、科普内容与专业资料如何统一维护",
    type: "运营方法",
    summary: "为未来后台 CMS 与 AI 编辑部的统一内容底座做展示铺垫。",
  },
] as const;

export const brandEntries = [
  {
    name: "静眠医疗",
    location: "广州",
    focus: "睡眠诊疗 / 检测服务",
    note: "适合未来承接机构入驻、榜单参评与专题合作。",
  },
  {
    name: "夜航实验室",
    location: "杭州",
    focus: "智能硬件 / 家用监测",
    note: "品牌库需要同时具备展示与筛选能力，这里先用卡片结构确认方向。",
  },
  {
    name: "眠语家居",
    location: "成都",
    focus: "床垫 / 睡眠环境",
    note: "后续可与产品库和标准栏目形成串联。",
  },
] as const;

export const adminMenu = [
  { label: "控制台", href: "/admin" },
  { label: "内容管理", href: "/admin/content" },
  { label: "词条管理", href: "/admin/terms" },
  { label: "品牌管理", href: "/admin/brands" },
  { label: "AI 编辑部", href: "/admin/ai-editorial" },
  { label: "SEO 字段", href: "#" },
] as const;

export const dashboardStats = [
  { label: "已搭建频道", value: "4", detail: "首页 / 词库 / 知识 / 品牌" },
  { label: "后台入口", value: "3", detail: "登录 / 控制台 / 两个管理页" },
  { label: "预留业务", value: "5", detail: "榜单 / 指数 / 标准 / 智库 / 产品" },
  { label: "当前阶段", value: "Demo", detail: "先确认方向，再细化模型与流程" },
] as const;

export const contentQueues = [
  {
    title: "首页推荐位",
    status: "待接数据库",
    summary: "当前先用静态内容确认门户首页的信息分区和推荐逻辑。",
  },
  {
    title: "知识内容队列",
    status: "待接 CMS",
    summary: "下一步会把统一 Content 实体和分类、标签、SEO 字段接进后台。",
  },
  {
    title: "品牌资料队列",
    status: "待接表单",
    summary: "骨架阶段只先确认未来入驻、展示、审核的承接位置是否合理。",
  },
] as const;

export const editorialSteps = [
  {
    step: "选题池",
    detail: "收集行业问题、用户搜索需求、专题方向与品牌合作线索。",
  },
  {
    step: "资料录入",
    detail: "沉淀来源、摘要、可信度备注，为 AI 初稿和人工编辑提供统一底稿。",
  },
  {
    step: "AI 初稿",
    detail: "未来接入模型服务层，目前只展示工作流位置和页面承接方式。",
  },
  {
    step: "人工编辑",
    detail: "突出 AI 编辑部不是自动发布，而是人机协作的运营流程。",
  },
  {
    step: "审核发布",
    detail: "为后续版本记录和发布状态流转预留统一入口。",
  },
] as const;

export const platformEntryCards = [
  {
    title: "睡眠词库",
    summary: "面向概念、术语、定义与知识节点的词条系统，是中眠网的基础知识底座。",
    href: "/terms",
    badge: "基础知识入口",
    group: "知识入口",
    action: "进入词条系统",
  },
  {
    title: "睡眠知识",
    summary: "面向问题、原因、建议与延伸阅读的解决路径入口，帮助用户真正找到答案。",
    href: "/knowledge",
    badge: "问题解决入口",
    group: "知识入口",
    action: "按问题路径进入",
  },
  {
    title: "睡眠品牌",
    summary: "面向品牌、企业、机构与服务能力的行业名录入口，承担展示与信任建立。",
    href: "/brands",
    badge: "品牌入口",
    group: "品牌与产业入口",
    action: "查看品牌名录",
  },
  {
    title: "中眠榜",
    summary: "用于承接品牌、机构、产品与行业参考维度的榜单体系，一期先把结构直接立住。",
    href: "#trust-entry",
    badge: "信任体系",
    group: "行业参考入口",
    action: "查看榜单结构",
  },
  {
    title: "中眠指数",
    summary: "用于承接行业趋势、品牌热度、问题关注度与市场信号的指数表达结构。",
    href: "#trust-entry",
    badge: "行业参考",
    group: "行业参考入口",
    action: "查看指数结构",
  },
  {
    title: "睡眠标准",
    summary: "用于承接术语、检测、产品、服务与研究规范的标准参考入口。",
    href: "#trust-entry",
    badge: "标准入口",
    group: "行业参考入口",
    action: "查看标准入口",
  },
  {
    title: "中眠智库",
    summary: "用于承接研究、报告、专题判断与行业观点，形成专业参考层。",
    href: "#trust-entry",
    badge: "智库入口",
    group: "行业参考入口",
    action: "进入智库结构",
  },
] as const;

export const heroCapabilityPanels = [
  {
    title: "睡眠知识入口",
    summary: "从词库、问题分类和知识路径进入，先解决“怎么查知识”这件事。",
    points: ["查术语与定义", "看热门问题", "按人群和场景进入"],
  },
  {
    title: "行业参考入口",
    summary: "从榜单、指数、标准和智库进入，先解决“怎么判断行业参考”这件事。",
    points: ["看榜单结构", "看指数信号", "看标准与智库"],
  },
  {
    title: "品牌与产业入口",
    summary: "从品牌名录、企业收录和合作入口进入，先解决“怎么找品牌与产业主体”这件事。",
    points: ["查看品牌名录", "按分类与地区找品牌", "进入合作与收录入口"],
  },
] as const;

export const homeEntranceLanes = [
  {
    eyebrow: "睡眠知识入口",
    title: "先从知识基础设施进入",
    description: "词库、问题入口、知识分类和典型专题在这里合成一条主入口，不让首页继续滑向内容流。",
    highlight: ["词条系统", "热门问题", "人群 / 场景", "典型专题"],
    entries: ["睡眠词库", "睡眠知识"],
  },
  {
    eyebrow: "行业参考入口",
    title: "再用榜单、指数、标准、智库看行业",
    description: "这一条入口不承担文章流，而是直接承担参考体系和信任结构，让中眠网更像行业入口。",
    highlight: ["中眠榜", "中眠指数", "睡眠标准", "中眠智库"],
    entries: ["中眠榜", "中眠指数", "睡眠标准", "中眠智库"],
  },
  {
    eyebrow: "品牌与产业入口",
    title: "最后进入品牌名录和产业合作",
    description: "让用户不只看内容，也能找品牌、看主体、理解企业合作与服务入口。",
    highlight: ["睡眠品牌", "企业入驻", "行业合作", "服务说明"],
    entries: ["睡眠品牌", "企业入驻 / 品牌收录"],
  },
] as const;

export const knowledgeEntryGroups = [
  {
    title: "睡眠词库入口",
    description: "把术语、定义、分类和相关概念集中组织，先让用户知道“去哪里查基础知识”。",
    items: ["失眠", "睡眠呼吸暂停", "深度睡眠", "儿童睡眠", "昼夜节律"],
  },
  {
    title: "热门问题入口",
    description: "从用户最常问的问题切入，让知识页不再像资讯页，而像问题入口。",
    items: ["为什么越睡越累", "打呼噜是不是病", "褪黑素怎么用", "孩子晚睡怎么办"],
  },
  {
    title: "知识分类入口",
    description: "按疾病问题、睡眠环境、设备工具、人群场景等维度建立分类层。",
    items: ["疾病与诊断", "环境与家居", "设备与工具", "人群与场景"],
  },
  {
    title: "典型问题专题",
    description: "直接形成“问题专题”结构，让人感知中眠网是知识基础设施，而不是内容流。",
    items: ["失眠专题", "打呼噜专题", "深度睡眠专题", "儿童睡眠专题"],
  },
] as const;

export const trustEntryCards = [
  {
    title: "睡眠品牌展示",
    summary: "用品牌名录、企业卡片和主营方向帮助用户建立行业参考和信任感。",
    signal: "行业名录",
  },
  {
    title: "中眠榜",
    summary: "把榜单入口作为信任结构的一部分，而不是后续附属模块。",
    signal: "榜单参考",
  },
  {
    title: "中眠指数",
    summary: "让指数结构提前出现在首页，说明中眠网未来不只是内容分发，而是行业参考系统。",
    signal: "趋势信号",
  },
  {
    title: "睡眠标准",
    summary: "用标准入口强化专业与可信度，帮助平台从内容站走向参考站。",
    signal: "标准参考",
  },
  {
    title: "中眠智库",
    summary: "用智库入口承接研究、报告和行业判断，让平台拥有更强的专业支点。",
    signal: "专业观点",
  },
] as const;

export const businessEntryCards = [
  {
    title: "企业入驻 / 品牌收录",
    summary: "面向品牌、机构、服务商开放基础入驻与名录收录，建立企业进入中眠网的第一入口。",
  },
  {
    title: "行业合作入口",
    summary: "承接品牌合作、专题共建、活动联动、研究传播等合作需求，明确平台有服务承接能力。",
  },
  {
    title: "榜单 / 指数 / 智库合作",
    summary: "将榜单、指数和智库直接纳入合作结构，而不是继续作为未来预留想法。",
  },
  {
    title: "睡眠产业服务说明",
    summary: "让首页直接表达中眠网未来可以服务企业、机构与行业合作方，而不只是提供内容阅读。",
  },
] as const;

export const contentFlowSections = [
  {
    title: "推荐内容",
    items: [
      "睡眠产业图谱：从诊疗、产品到服务的一级结构",
      "睡眠环境治理指南：床垫、灯光、温湿度与噪声",
      "睡眠监测设备入门：家用、医疗级与消费级的差别",
    ],
  },
  {
    title: "最新更新",
    items: [
      "中眠网将按知识入口、品牌入口、信任入口、服务入口重构首页",
      "词库页将强化定义、节点、关联，而不是继续像内容列表",
      "品牌页将按企业名片思路强化分类、地区和主营方向表达",
    ],
  },
] as const;

export const termDirectoryGroups = [
  { name: "疾病与诊断", count: 36 },
  { name: "设备与工具", count: 24 },
  { name: "环境与家居", count: 18 },
  { name: "基础科学", count: 15 },
  { name: "人群与场景", count: 21 },
] as const;

export const termNodeCards = [
  {
    title: "睡眠呼吸暂停",
    definition: "指睡眠过程中反复出现呼吸暂停或低通气的睡眠相关疾病。",
    category: "疾病与诊断",
    relatedCount: 12,
    relatedEntry: "相关问题、设备与品牌入口",
  },
  {
    title: "昼夜节律",
    definition: "指人体生理活动围绕昼夜循环形成的时间节律系统。",
    category: "基础科学",
    relatedCount: 9,
    relatedEntry: "相关人群与睡眠作息入口",
  },
  {
    title: "睡眠监测",
    definition: "指对睡眠时长、结构、呼吸、心率等指标进行记录与分析的过程。",
    category: "设备与工具",
    relatedCount: 14,
    relatedEntry: "相关设备、品牌与知识入口",
  },
  {
    title: "睡眠卫生",
    definition: "指帮助改善睡眠的行为规范、环境管理与生活方式建议集合。",
    category: "环境与家居",
    relatedCount: 11,
    relatedEntry: "相关建议、问题与专题入口",
  },
] as const;

export const knowledgeProblemCategories = [
  "入睡困难",
  "睡眠质量差",
  "打呼噜 / 呼吸问题",
  "儿童睡眠问题",
  "作息节律紊乱",
  "环境影响睡眠",
] as const;

export const knowledgeScenarioGroups = [
  {
    title: "人群分类",
    items: ["儿童", "青少年", "上班族", "老年人", "孕产人群"],
  },
  {
    title: "场景分类",
    items: ["居家睡眠", "出差睡眠", "医院检查", "助眠产品选择", "长期作息管理"],
  },
] as const;

export const knowledgeSolutionCards = [
  {
    problem: "晚上总是睡不着",
    reason: "可能与作息错乱、情绪压力、环境刺激或疾病因素有关。",
    advice: "先识别问题类型，再看习惯调整、环境优化、医学检查的优先级。",
    reading: "延伸到失眠专题、睡眠卫生词条和相关品牌服务入口。",
  },
  {
    problem: "打呼噜影响睡眠",
    reason: "可能只是上气道狭窄，也可能涉及睡眠呼吸暂停。",
    advice: "先区分普通打呼噜和高风险信号，再决定是否进入检测与诊断路径。",
    reading: "延伸到睡眠呼吸暂停词条、监测设备知识和相关品牌入口。",
  },
  {
    problem: "孩子睡得晚、起不来",
    reason: "可能与作息节律、环境习惯、家庭管理方式等因素相关。",
    advice: "从问题识别、人群特点和家庭干预建议三层逐步进入。",
    reading: "延伸到儿童睡眠专题、人群分类和解决路径内容。",
  },
] as const;

export const brandCategoryGroups = [
  "睡眠监测",
  "睡眠诊疗",
  "床垫与家居",
  "助眠设备",
  "研究与服务机构",
] as const;

export const brandDirectoryCards = [
  {
    name: "眠域科技",
    category: "睡眠监测",
    focus: "家用睡眠监测 / 数据服务",
    region: "华东",
    city: "上海",
    trust: "已被中眠网收录，可承接后续品牌展示与合作入口。",
  },
  {
    name: "深眠研究院",
    category: "研究与服务机构",
    focus: "睡眠研究 / 专题合作 / 科普内容",
    region: "华北",
    city: "北京",
    trust: "适合连接智库入口、专题内容与合作服务说明。",
  },
  {
    name: "舒睡空间",
    category: "床垫与家居",
    focus: "床垫系统 / 睡眠环境方案",
    region: "华南",
    city: "深圳",
    trust: "适合连接品牌展示、榜单参考和企业入驻入口。",
  },
] as const;
