/**
 * 文件说明：该文件实现中眠网后台登录页骨架。
 * 功能说明：用于确认后台入口风格与登录承接位置，当前不接真实鉴权。
 *
 * 结构概览：
 *   第一部分：页面实现
 */

import Link from "next/link";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef2ef] px-6 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-line bg-surface p-8 shadow-[0_16px_40px_rgba(24,50,57,0.08)]">
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-accent-soft px-4 py-2 text-sm font-medium text-accent">
            后台登录 Demo
          </span>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            登录中眠网管理后台
          </h1>
          <p className="text-sm leading-7 text-muted">
            当前只确认后台入口样式和路由位置。鉴权、角色和权限模型会在下一阶段接入。
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl border border-line bg-surface-soft px-4 py-3 text-sm text-muted">
            账号输入框占位
          </div>
          <div className="rounded-2xl border border-line bg-surface-soft px-4 py-3 text-sm text-muted">
            密码输入框占位
          </div>
          <Link
            href="/admin"
            className="flex h-12 items-center justify-center rounded-2xl bg-brand font-medium text-white transition hover:bg-brand-strong"
          >
            进入后台骨架
          </Link>
        </div>
      </div>
    </div>
  );
}
