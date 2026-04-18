/**
 * 文件说明：该文件实现中眠网后台“AI 编辑部”骨架页面。
 * 功能说明：展示 AI 编辑部在后台里的基础流程位置，突出人机协作而非全自动发布。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：AI 编辑部页面实现
 */

import { editorialSteps } from "@/lib/demo-data";

export default function AdminAiEditorialPage() {
  return (
    <div className="space-y-6">
      {/* ========== 第一部分：流程说明 ========== */}
      <section className="rounded-[28px] border border-line bg-surface-soft p-6">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          AI 编辑部先做轻量工作流，不追求过度自动化
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-muted">
          当前页面只先确认选题池、资料录入、AI 初稿、人工编辑、审核发布这些节点在后台中的承接方式。
          下一步再把版本记录、提示词策略和模型调用封装到独立服务层。
        </p>
      </section>

      {/* ========== 第二部分：流程卡片 ========== */}
      <section className="grid gap-4 xl:grid-cols-5">
        {editorialSteps.map((item, index) => (
          <div
            key={item.step}
            className="rounded-[24px] border border-line bg-white p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-brand">
                步骤 {index + 1}
              </span>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                demo
              </span>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              {item.step}
            </h3>
            <p className="mt-4 text-sm leading-7 text-muted">{item.detail}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
