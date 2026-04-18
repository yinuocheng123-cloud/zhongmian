/**
 * 文件说明：该文件实现中眠网后台控制台骨架页面。
 * 功能说明：展示后台模块概览与当前 demo 范围，帮助确认管理端整体信息架构。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：控制台页面实现
 */

import { dashboardStats } from "@/lib/demo-data";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* ========== 第一部分：统计卡片 ========== */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-line bg-surface-soft p-5"
          >
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold text-foreground">
              {item.value}
            </p>
            <p className="mt-3 text-sm leading-7 text-muted">{item.detail}</p>
          </div>
        ))}
      </section>

      {/* ========== 第二部分：下一步说明 ========== */}
      <section className="rounded-[28px] border border-line bg-surface-soft p-6">
        <h2 className="font-serif text-2xl font-semibold text-foreground">
          当前控制台想确认的不是数据，而是管理结构
        </h2>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-muted">
          后台左侧先固定为“控制台、内容管理、AI 编辑部”三条主线，再逐步接上词条、
          品牌、SEO 字段、发布流程和权限系统，确保后台不会在一期就变成过重的平台。
        </p>
      </section>
    </div>
  );
}
