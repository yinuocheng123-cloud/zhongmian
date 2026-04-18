/**
 * 文件说明：该文件实现中眠网“关于我们”骨架页面。
 * 功能说明：简要说明中眠网定位与一期阶段目标，便于 demo 阶段统一对外口径。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：页面实现
 */

import type { Metadata } from "next";
import { SectionHeading } from "@/components/shared/section-heading";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "关于中眠网",
  description:
    "了解中眠网作为中国睡眠产业基础知识入口、信任入口与商业入口的平台定位与一期建设方向。",
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="portal-shell">
      <section className="portal-card rounded-[32px] p-8 sm:p-10">
        <SectionHeading
          eyebrow="关于中眠网"
          title="先做基础设施，再做复杂业务"
          description="当前 demo 阶段的核心目标，是确认门户前台、知识底座、品牌展示和后台 AI 编辑部的整体方向。"
        />
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            "基础知识入口：用词库和知识库建立行业内容基座。",
            "信任入口：用品牌库和专题结构承接企业与机构展示。",
            "商业入口：为会员、榜单、指数、联盟与大会业务预留稳定位置。",
          ].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-line bg-surface-soft p-5 text-sm leading-7 text-muted"
            >
              {item}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
