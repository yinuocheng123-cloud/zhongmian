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

  // ========== 第五部分：统一内容 ==========
  const content = await prisma.content.upsert({
    where: { slug: "sleep-industry-map" },
    update: {},
    create: {
      title: "睡眠产业图谱：从诊疗、产品到服务的一级结构",
      slug: "sleep-industry-map",
      contentType: "KNOWLEDGE",
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
      OR: [{ contentId: content.id }, { termId: term.id }, { brandId: brand.id }],
    },
  });

  await prisma.workflow.createMany({
    data: [
      {
        targetType: "CONTENT",
        contentId: content.id,
        fromStatus: null,
        toStatus: "DRAFT",
        note: "系统初始化内容草稿。",
        actorName: "system-seed",
      },
      {
        targetType: "CONTENT",
        contentId: content.id,
        fromStatus: "DRAFT",
        toStatus: "PUBLISHED",
        note: "演示数据直接发布，便于前台联调。",
        actorName: "system-seed",
      },
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
    ],
  });

  // ========== 第七部分：AI 任务预留 ==========
  await prisma.aiTask.deleteMany({
    where: { contentId: content.id },
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
