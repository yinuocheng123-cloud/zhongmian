/**
 * 文件说明：该文件实现中眠网后台布局组件。
 * 功能说明：统一后台侧边导航、头部说明与内容容器，便于后续模块继续扩展。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：后台布局组件
 */

import Link from "next/link";
import { adminMenu } from "@/lib/demo-data";

type AdminShellProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AdminShell({
  title,
  description,
  children,
}: AdminShellProps) {
  return (
    <div className="min-h-screen bg-[#eef2ef]">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-line bg-brand-strong px-6 py-8 text-white">
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-lg font-semibold">
                中
              </span>
              <div>
                <p className="font-serif text-2xl font-semibold">中眠网后台</p>
                <p className="text-sm text-white/70">CMS + AI 编辑部基础版</p>
              </div>
            </Link>
          </div>

          <nav className="mt-10 space-y-3">
            {adminMenu.map((item) =>
              item.href === "#" ? (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/12 px-4 py-3 text-sm text-white/55"
                >
                  {item.label}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block rounded-2xl border border-white/12 px-4 py-3 text-sm transition hover:bg-white/8"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </aside>

        <main className="px-6 py-8 lg:px-10">
          <div className="portal-card rounded-[28px] p-8">
            <div className="mb-8 flex flex-col gap-3 border-b border-line pb-6">
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
                后台骨架
              </span>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted">
                {description}
              </p>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
