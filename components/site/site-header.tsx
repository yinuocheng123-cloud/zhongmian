/**
 * 文件说明：该文件实现中眠网前台门户的顶部导航骨架。
 * 功能说明：承载品牌识别、一级导航、会员入口与预留频道提示。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：前台头部组件
 */

import Link from "next/link";
import { reservedChannels, siteNav } from "@/lib/demo-data";

export function SiteHeader() {
  return (
    <header className="border-b border-line/70 bg-white/92 backdrop-blur">
      <div className="border-b border-white/10 bg-[#0F172A] text-white">
        <div className="portal-shell flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
          <p>中眠网：先把睡眠知识入口、行业参考入口、品牌与产业入口显性摆出来。</p>
          <div className="flex flex-wrap gap-4 text-white/75">
            <span>词库 / 知识是知识入口</span>
            <span>榜单 / 指数 / 标准 / 智库是行业参考入口</span>
            <span>品牌名录 / 企业入驻 / 合作服务是产业入口</span>
          </div>
        </div>
      </div>

      <div className="portal-shell flex flex-col gap-6 py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0F172A] text-lg font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.2)]">
                中
              </span>
              <div>
                <p className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                  中眠网
                </p>
                <p className="text-sm text-muted">
                  中国睡眠产业的知识入口、品牌入口、信任入口与服务入口
                </p>
              </div>
            </Link>
          </div>

          <nav className="flex flex-wrap gap-2 text-sm text-foreground/85">
            {siteNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full border border-line bg-surface-soft px-4 py-2 transition hover:border-brand hover:bg-brand/6 hover:text-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="portal-divider flex flex-wrap items-center gap-3 pt-5 text-sm">
          <span className="rounded-full bg-[#FCD34D] px-3 py-1 font-medium text-[#0F172A]">
            信任与参考结构
          </span>
          {reservedChannels.map((channel) => (
            <span
              key={channel}
              className="rounded-full border border-dashed border-line bg-white px-3 py-1 text-muted"
            >
              {channel}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
