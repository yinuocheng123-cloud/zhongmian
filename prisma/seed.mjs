/**
 * 文件说明：该文件提供中眠网一期模型的基础 seed 方案。
 * 功能说明：用最小演示数据初始化分类、标签、词条、品牌、知识内容与工作流记录，便于后续后台和详情页联调。
 *
 * 结构概览：
 *   第一部分：初始化 Prisma Client
 *   第二部分：基础分类与标签
 *   第三部分：词条、品牌、内容与工作流种子
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ========== 第一部分：基础分类 ==========
  const knowledgeCategory = await prisma.category.upsert({
    where: { slug: "sleep-knowledge" },
    update: {},
    create: {
      name: "睡眠知识",
      slug: "sleep-knowledge",
      scope: "CONTENT",
      description: "用于承载知识、指南、专题等内容栏目。",
      sortOrder: 10,
    },
  });

  const termCategory = await prisma.category.upsert({
    where: { slug: "sleep-terms" },
    update: {},
    create: {
      name: "睡眠词库",
      slug: "sleep-terms",
      scope: "TERM",
      description: "用于承载概念、术语、定义类词条。",
      sortOrder: 20,
    },
  });

  const brandCategory = await prisma.category.upsert({
    where: { slug: "sleep-brands" },
    update: {},
    create: {
      name: "睡眠品牌",
      slug: "sleep-brands",
      scope: "BRAND",
      description: "用于承载品牌、企业、机构类展示信息。",
      sortOrder: 30,
    },
  });

  const trendsCategory = await prisma.category.upsert({
    where: { slug: "industry-trends" },
    update: {},
    create: {
      name: "行业趋势",
      slug: "industry-trends",
      scope: "CONTENT",
      description: "用于承载睡眠产业趋势、长期变化与结构观察内容。",
      sortOrder: 40,
    },
  });

  const eventsCategory = await prisma.category.upsert({
    where: { slug: "industry-events" },
    update: {},
    create: {
      name: "行业事件",
      slug: "industry-events",
      scope: "CONTENT",
      description: "用于承载睡眠行业展会、论坛、发布会与年度事件内容。",
      sortOrder: 50,
    },
  });

  const rankingsCategory = await prisma.category.upsert({
    where: { slug: "industry-rankings" },
    update: {},
    create: {
      name: "中眠榜",
      slug: "industry-rankings",
      scope: "CONTENT",
      description: "用于承载睡眠品牌、产品与服务相关的参考榜单内容。",
      sortOrder: 60,
    },
  });

  const indexesCategory = await prisma.category.upsert({
    where: { slug: "industry-indexes" },
    update: {},
    create: {
      name: "中眠指数",
      slug: "industry-indexes",
      scope: "CONTENT",
      description: "用于承载睡眠消费、关注度与城市睡眠等数据指数内容。",
      sortOrder: 70,
    },
  });

  const standardsCategory = await prisma.category.upsert({
    where: { slug: "industry-standards" },
    update: {},
    create: {
      name: "睡眠标准",
      slug: "industry-standards",
      scope: "CONTENT",
      description: "用于承载睡眠产品、服务、环境与术语标准内容。",
      sortOrder: 80,
    },
  });

  const thinkTankCategory = await prisma.category.upsert({
    where: { slug: "industry-think-tank" },
    update: {},
    create: {
      name: "中眠智库",
      slug: "industry-think-tank",
      scope: "CONTENT",
      description: "用于承载白皮书、研究报告、专题观察与专家观点内容。",
      sortOrder: 90,
    },
  });

  // ========== 第二部分：标签 ==========
  const industryTag = await prisma.tag.upsert({
    where: { slug: "industry" },
    update: {},
    create: {
      name: "产业观察",
      slug: "industry",
      description: "用于行业观察类内容与品牌、词条关联。",
    },
  });

  const apneaTag = await prisma.tag.upsert({
    where: { slug: "sleep-apnea" },
    update: {},
    create: {
      name: "睡眠呼吸暂停",
      slug: "sleep-apnea",
      description: "用于睡眠呼吸暂停相关内容、词条和品牌聚合。",
    },
  });

  const trendsTag = await prisma.tag.upsert({
    where: { slug: "trend-observation" },
    update: {},
    create: {
      name: "趋势观察",
      slug: "trend-observation",
      description: "用于趋势解读、产业观察与结构判断类内容。",
    },
  });

  const eventTag = await prisma.tag.upsert({
    where: { slug: "industry-event" },
    update: {},
    create: {
      name: "行业事件",
      slug: "industry-event",
      description: "用于展会、论坛、发布会与年度事件类内容。",
    },
  });

  const rankingTag = await prisma.tag.upsert({
    where: { slug: "ranking-reference" },
    update: {},
    create: {
      name: "榜单参考",
      slug: "ranking-reference",
      description: "用于榜单、入榜对象与评估维度说明内容。",
    },
  });

  const indexTag = await prisma.tag.upsert({
    where: { slug: "index-observation" },
    update: {},
    create: {
      name: "指数观察",
      slug: "index-observation",
      description: "用于消费、城市睡眠与数据口径类指数内容。",
    },
  });

  const standardTag = await prisma.tag.upsert({
    where: { slug: "standard-reference" },
    update: {},
    create: {
      name: "标准参考",
      slug: "standard-reference",
      description: "用于标准说明、适用范围与版本更新类内容。",
    },
  });

  const thinkTankTag = await prisma.tag.upsert({
    where: { slug: "think-tank-report" },
    update: {},
    create: {
      name: "智库研究",
      slug: "think-tank-report",
      description: "用于研究、白皮书、趋势报告与行业观察内容。",
    },
  });

  // ========== 第三部分：词条 ==========
  const term = await prisma.term.upsert({
    where: { slug: "sleep-apnea" },
    update: {},
    create: {
      name: "睡眠呼吸暂停",
      slug: "sleep-apnea",
      aliases: ["OSA", "阻塞性睡眠呼吸暂停"],
      shortDefinition: "一种在睡眠中反复出现呼吸暂停或低通气的睡眠相关疾病。",
      definition:
        "睡眠呼吸暂停通常表现为睡眠过程中气流中断、血氧下降与白天嗜睡等症状，是睡眠医学和呼吸医学的重要交叉问题。",
      body:
        "这里是一段词条正文示例，用于演示词条页未来如何承载定义、延伸解释、关联问题与延伸阅读。",
      seoTitle: "睡眠呼吸暂停是什么意思",
      seoDescription: "中眠网词库示例：介绍睡眠呼吸暂停的基础定义、场景与延伸阅读。",
      seoKeywords: ["睡眠呼吸暂停", "OSA", "睡眠词库"],
      workflowStatus: "PUBLISHED",
      isFeatured: true,
      publishedAt: new Date(),
      categories: {
        connect: [{ id: termCategory.id }],
      },
      tags: {
        connect: [{ id: industryTag.id }, { id: apneaTag.id }],
      },
    },
  });

  // ========== 第四部分：品牌 ==========
  const brand = await prisma.brand.upsert({
    where: { slug: "mianyu-tech" },
    update: {},
    create: {
      name: "眠域科技",
      slug: "mianyu-tech",
      legalName: "上海眠域科技有限公司",
      tagline: "专注睡眠监测与数据服务",
      summary: "用于品牌库与未来会员入驻体系的演示品牌。",
      description:
        "品牌 seed 数据主要用于验证 Brand 模型、内容关联与工作流状态是否能够支撑前后台展示。",
      website: "https://example.com",
      region: "华东",
      city: "上海",
      contactName: "中眠网演示联系人",
      contactEmail: "brand@example.com",
      seoTitle: "眠域科技品牌介绍",
      seoDescription: "中眠网品牌库示例：眠域科技的基础资料、主营方向与行业定位。",
      seoKeywords: ["眠域科技", "睡眠监测", "品牌库"],
      workflowStatus: "PUBLISHED",
      isFeatured: true,
      publishedAt: new Date(),
      categories: {
        connect: [{ id: brandCategory.id }],
      },
      tags: {
        connect: [{ id: industryTag.id }, { id: apneaTag.id }],
      },
    },
  });

  const clinicBrand = await prisma.brand.upsert({
    where: { slug: "anmian-clinic" },
    update: {},
    create: {
      name: "安眠诊研",
      slug: "anmian-clinic",
      legalName: "北京安眠诊研科技有限公司",
      tagline: "聚焦睡眠诊疗与临床路径服务",
      summary: "用于验证品牌进展、榜单与智库内容中的品牌关联关系。",
      description:
        "安眠诊研的种子数据主要用于验证品牌主体与行业事件、品牌进展和榜单内容之间的前后台联动关系。",
      website: "https://example.com/clinic",
      region: "华北",
      city: "北京",
      contactName: "品牌收录示例联系人",
      contactEmail: "clinic@example.com",
      seoTitle: "安眠诊研品牌介绍",
      seoDescription: "中眠网品牌库示例：安眠诊研的诊疗服务定位与品牌基础资料。",
      seoKeywords: ["安眠诊研", "睡眠诊疗", "品牌库"],
      workflowStatus: "PUBLISHED",
      publishedAt: new Date(),
      categories: {
        connect: [{ id: brandCategory.id }],
      },
      tags: {
        connect: [{ id: industryTag.id }],
      },
    },
  });

  // ========== 第五部分：统一内容 ==========
  const content = await prisma.content.upsert({
    where: { slug: "sleep-industry-map" },
    update: {
      title: "睡眠产业图谱：从诊疗、产品到服务的一级结构",
      contentType: "KNOWLEDGE",
      channelKey: "KNOWLEDGE",
      summary: "用于演示统一内容底座如何承载知识型内容。",
      body:
        "这里是一段内容正文示例，用于后续详情页、后台表单、版本记录与 AI 编辑部工作流联调。",
      authorName: "中眠网编辑部",
      seoTitle: "睡眠产业图谱",
      seoDescription: "中眠网知识内容示例：展示统一内容模型如何服务知识库和专题型页面。",
      seoKeywords: ["睡眠产业", "知识库", "门户内容"],
      workflowStatus: "PUBLISHED",
      isFeatured: true,
      publishedAt: new Date(),
      categories: {
        set: [{ id: knowledgeCategory.id }],
      },
      tags: {
        set: [{ id: industryTag.id }, { id: apneaTag.id }],
      },
      relatedTerms: {
        set: [{ id: term.id }],
      },
      relatedBrands: {
        set: [{ id: brand.id }],
      },
    },
    create: {
      title: "睡眠产业图谱：从诊疗、产品到服务的一级结构",
      slug: "sleep-industry-map",
      contentType: "KNOWLEDGE",
      channelKey: "KNOWLEDGE",
      summary: "用于演示统一内容底座如何承载知识型内容。",
      body:
        "这里是一段内容正文示例，用于后续详情页、后台表单、版本记录与 AI 编辑部工作流联调。",
      authorName: "中眠网编辑部",
      seoTitle: "睡眠产业图谱",
      seoDescription: "中眠网知识内容示例：展示统一内容模型如何服务知识库和专题型页面。",
      seoKeywords: ["睡眠产业", "知识库", "门户内容"],
      workflowStatus: "PUBLISHED",
      isFeatured: true,
      publishedAt: new Date(),
      categories: {
        connect: [{ id: knowledgeCategory.id }],
      },
      tags: {
        connect: [{ id: industryTag.id }, { id: apneaTag.id }],
      },
      relatedTerms: {
        connect: [{ id: term.id }],
      },
      relatedBrands: {
        connect: [{ id: brand.id }],
      },
    },
  });

  const reservedContents = [
    {
      slug: "sleep-consumption-trend-2026",
      title: "2026 睡眠消费趋势观察：从设备购买转向组合式睡眠服务",
      contentType: "REPORT",
      channelKey: "TRENDS",
      summary:
        "围绕消费结构、服务组合和家庭睡眠场景变化，解释 2026 年睡眠消费趋势的核心信号。",
      body:
        "这是一条趋势解读示例内容，用于承接趋势解释、结构观察和长期变化判断。后续可继续补充更多公开数据、案例与方法演进说明。",
      categories: [trendsCategory.id],
      tags: [industryTag.id, trendsTag.id],
      relatedBrands: [brand.id],
      seoKeywords: ["睡眠趋势", "睡眠消费", "趋势观察"],
    },
    {
      slug: "sleep-forum-shanghai-2026",
      title: "2026 上海睡眠产业论坛：从诊疗协同到居家服务整合",
      contentType: "ARTICLE",
      channelKey: "EVENTS",
      summary:
        "围绕论坛议题、参会对象和行业协同方向，对 2026 上海睡眠产业论坛做结构化归纳。",
      body:
        "这是一条行业事件示例内容，用于承接展会、论坛、发布会和年度事件入口。正文优先保留时间、地点、类型与核心议题说明，不退回普通新闻流。",
      categories: [eventsCategory.id],
      tags: [industryTag.id, eventTag.id],
      eventStartAt: new Date("2026-06-18T09:00:00+08:00"),
      eventLocation: "上海",
      eventKind: "行业论坛",
      seoKeywords: ["睡眠论坛", "行业事件", "上海"],
    },
    {
      slug: "mianyu-home-service-progress-2026",
      title: "眠域科技 2026 品牌进展：家用睡眠监测从硬件走向服务组合",
      contentType: "ARTICLE",
      channelKey: "BRAND_PROGRESS",
      summary:
        "从产品组合、服务方向和合作生态三个角度，观察眠域科技在 2026 年的品牌进展。",
      body:
        "这是一条品牌进展示例内容，用于承接品牌能力变化、产品方向和企业进展的结构化观察。正文优先强调品牌主体关系，不退回企业新闻流。",
      categories: [brandCategory.id],
      tags: [industryTag.id, trendsTag.id],
      relatedBrands: [brand.id, clinicBrand.id],
      seoKeywords: ["品牌进展", "眠域科技", "睡眠监测"],
    },
    {
      slug: "zhongmian-brand-ranking-2026",
      title: "2026 中眠榜：睡眠品牌与服务能力参考榜单说明",
      contentType: "RANKING",
      channelKey: "RANKINGS",
      summary:
        "说明 2026 中眠榜的评估目标、维度口径、样本范围和入榜对象，帮助用户把榜单当作行业参考入口来理解。",
      body:
        "这是一条榜单说明示例内容，用于承接榜单名称、评估维度、入榜对象、排序说明和发布时间等核心结构。后续可继续补充更多榜单对象与维度细节。",
      categories: [rankingsCategory.id],
      tags: [industryTag.id, rankingTag.id],
      relatedBrands: [brand.id, clinicBrand.id],
      seoKeywords: ["中眠榜", "睡眠榜单", "品牌榜"],
    },
    {
      slug: "city-sleep-index-2026",
      title: "2026 中眠指数：城市睡眠关注度与消费变化观察",
      contentType: "INDEX",
      channelKey: "INDEXES",
      summary:
        "围绕关注度、消费变化和城市样本，对 2026 年城市睡眠指数做结构化说明。",
      body:
        "这是一条指数说明示例内容，用于承接指数名称、摘要、数据说明和结构化正文。当前不强制复杂图表，也能清楚表达指数口径与观察结论。",
      categories: [indexesCategory.id],
      tags: [industryTag.id, indexTag.id],
      seoKeywords: ["中眠指数", "城市睡眠", "消费观察"],
    },
    {
      slug: "sleep-environment-standard-v1",
      title: "睡眠环境参考标准 V1：适用范围、核心条目与说明",
      contentType: "STANDARD",
      channelKey: "STANDARDS",
      summary:
        "面向睡眠环境场景，说明一版可公开解释的参考标准结构、适用范围与核心条目。",
      body:
        "这是一条标准说明示例内容，用于承接标准名称、适用范围、核心条目、版本号与发布时间。当前表达应保持克制、专业，避免退回普通文章。",
      categories: [standardsCategory.id],
      tags: [industryTag.id, standardTag.id],
      referenceVersion: "V1.0",
      seoKeywords: ["睡眠标准", "环境标准", "术语标准"],
    },
    {
      slug: "sleep-industry-white-paper-2026",
      title: "2026 中国睡眠产业观察白皮书：结构变化与服务协同",
      contentType: "THINK_TANK",
      channelKey: "THINK_TANK",
      summary:
        "围绕诊疗、产品、服务与渠道协同，给出 2026 年睡眠产业观察白皮书的结构化摘要。",
      body:
        "这是一条智库示例内容，用于承接白皮书、趋势报告、研究观察和专家观点。正文可继续扩展专题判断、样本说明与研究边界。",
      categories: [thinkTankCategory.id],
      tags: [industryTag.id, thinkTankTag.id],
      relatedBrands: [clinicBrand.id],
      seoKeywords: ["中眠智库", "白皮书", "趋势报告"],
    },
  ];

  const publishedContentIds = [content.id];

  for (const item of reservedContents) {
    const savedContent = await prisma.content.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        contentType: item.contentType,
        channelKey: item.channelKey,
        summary: item.summary,
        body: item.body,
        workflowStatus: "PUBLISHED",
        publishedAt: new Date(),
        eventStartAt: item.eventStartAt ?? null,
        eventLocation: item.eventLocation ?? null,
        eventKind: item.eventKind ?? null,
        referenceVersion: item.referenceVersion ?? null,
        seoKeywords: item.seoKeywords,
        categories: {
          set: item.categories.map((id) => ({ id })),
        },
        tags: {
          set: item.tags.map((id) => ({ id })),
        },
        relatedBrands: {
          set: (item.relatedBrands ?? []).map((id) => ({ id })),
        },
      },
      create: {
        title: item.title,
        slug: item.slug,
        contentType: item.contentType,
        channelKey: item.channelKey,
        summary: item.summary,
        body: item.body,
        workflowStatus: "PUBLISHED",
        publishedAt: new Date(),
        eventStartAt: item.eventStartAt ?? null,
        eventLocation: item.eventLocation ?? null,
        eventKind: item.eventKind ?? null,
        referenceVersion: item.referenceVersion ?? null,
        seoKeywords: item.seoKeywords,
        categories: {
          connect: item.categories.map((id) => ({ id })),
        },
        tags: {
          connect: item.tags.map((id) => ({ id })),
        },
        relatedBrands: {
          connect: (item.relatedBrands ?? []).map((id) => ({ id })),
        },
      },
      select: {
        id: true,
        title: true,
        summary: true,
        body: true,
      },
    });

    publishedContentIds.push(savedContent.id);

    await prisma.contentVersion.upsert({
      where: {
        contentId_versionNumber: {
          contentId: savedContent.id,
          versionNumber: 1,
        },
      },
      update: {
        titleSnapshot: savedContent.title,
        summarySnapshot: savedContent.summary,
        bodySnapshot: savedContent.body,
        changeNote: "预留扩展栏目初始化版本",
      },
      create: {
        contentId: savedContent.id,
        versionNumber: 1,
        titleSnapshot: savedContent.title,
        summarySnapshot: savedContent.summary,
        bodySnapshot: savedContent.body,
        changeNote: "预留扩展栏目初始化版本",
        createdBy: "system-seed",
      },
    });
  }

  // ========== 第六部分：内容版本与工作流 ==========
  await prisma.contentVersion.upsert({
    where: {
      contentId_versionNumber: {
        contentId: content.id,
        versionNumber: 1,
      },
    },
    update: {},
    create: {
      contentId: content.id,
      versionNumber: 1,
      titleSnapshot: content.title,
      summarySnapshot: content.summary,
      bodySnapshot: content.body,
      changeNote: "初始种子版本",
      createdBy: "system-seed",
    },
  });

  await prisma.workflow.deleteMany({
    where: {
      OR: [
        { contentId: { in: publishedContentIds } },
        { termId: term.id },
        { brandId: { in: [brand.id, clinicBrand.id] } },
      ],
    },
  });

  await prisma.workflow.createMany({
    data: [
      ...publishedContentIds.flatMap((contentId) => [
        {
          targetType: "CONTENT",
          contentId,
          fromStatus: null,
          toStatus: "DRAFT",
          note: "系统初始化内容草稿。",
          actorName: "system-seed",
        },
        {
          targetType: "CONTENT",
          contentId,
          fromStatus: "DRAFT",
          toStatus: "PUBLISHED",
          note: "演示数据直接发布，便于前台联调。",
          actorName: "system-seed",
        },
      ]),
      {
        targetType: "TERM",
        termId: term.id,
        fromStatus: null,
        toStatus: "PUBLISHED",
        note: "演示词条初始化。",
        actorName: "system-seed",
      },
      {
        targetType: "BRAND",
        brandId: brand.id,
        fromStatus: null,
        toStatus: "PUBLISHED",
        note: "演示品牌初始化。",
        actorName: "system-seed",
      },
      {
        targetType: "BRAND",
        brandId: clinicBrand.id,
        fromStatus: null,
        toStatus: "PUBLISHED",
        note: "扩展品牌初始化。",
        actorName: "system-seed",
      },
    ],
  });

  // ========== 第七部分：AI 任务预留 ==========
  await prisma.aiTask.deleteMany({
    where: {
      contentId: { in: publishedContentIds },
    },
  });

  await prisma.aiTask.create({
    data: {
      taskType: "FIRST_DRAFT",
      status: "SUCCEEDED",
      modelName: "demo-model",
      prompt: "根据睡眠产业图谱整理一版知识内容初稿。",
      outputText: "这是一个用于演示 AI 编辑部任务关系的占位输出。",
      finishedAt: new Date(),
      contentId: content.id,
    },
  });

  console.log("中眠网 seed 数据初始化完成。");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
