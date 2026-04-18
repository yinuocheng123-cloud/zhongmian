/**
 * 文件说明：该文件实现中眠网前台站点的统一未找到兜底页。
 * 功能说明：当详情页数据不存在、未发布或 slug 无效时，向前台返回一致的行业门户式提示。
 *
 * 结构概览：
 *   第一部分：页面标题与说明
 *   第二部分：返回入口
 */

import Link from "next/link";

export default function SiteNotFound() {
  return (
    <div className="portal-shell">
      <section className="portal-card rounded-[32px] border border-line p-8 sm:p-10">
        <div className="max-w-3xl space-y-5">
          <span className="inline-flex rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-brand">
            内容未开放
          </span>
          <div className="space-y-3">
            <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              当前页面不存在，或该内容尚未发布
            </h1>
            <p className="text-sm leading-7 text-muted sm:text-base">
              中眠网前台只展示已发布的睡眠知识、词条与品牌内容。若你是从后台刚完成录入，请先确认状态已切换到“已发布”。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/knowledge"
              className="rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-strong"
            >
              返回睡眠知识
            </Link>
            <Link
              href="/terms"
              className="rounded-full border border-line bg-surface-soft px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
            >
              返回睡眠词库
            </Link>
            <Link
              href="/brands"
              className="rounded-full border border-line bg-surface-soft px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand hover:text-brand"
            >
              返回睡眠品牌
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
