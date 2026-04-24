/**
 * 文件说明：该文件实现中眠网后台真实登录页。
 * 功能说明：负责展示后台登录表单、提示当前鉴权配置状态，并在已登录时跳转到后台主面板。
 *
 * 结构概览：
 *   第一部分：导入依赖与查询参数类型
 *   第二部分：登录错误提示映射
 *   第三部分：后台登录页实现
 */

import { redirect } from "next/navigation";
import {
  getAdminCredentialPreview,
  getAdminLoginHint,
  getOptionalAdminSession,
  sanitizeAdminNextPath,
} from "@/features/admin/auth/session";

type PageProps = {
  searchParams: Promise<{
    next?: string;
    notice?: string;
    error?: string;
  }>;
};

export const dynamic = "force-dynamic";

function resolveLoginErrorMessage(errorCode?: string) {
  if (!errorCode) {
    return null;
  }

  const messageMap: Record<string, string> = {
    missing: "请先补全后台账号与密码。",
    invalid: "账号或密码不正确，请重新输入。",
    unavailable:
      "当前环境缺少后台鉴权配置，请先补齐 ADMIN_USERNAME、ADMIN_PASSWORD、ADMIN_SESSION_SECRET。",
  };

  return messageMap[errorCode] ?? "登录失败，请稍后重试。";
}

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const session = await getOptionalAdminSession();

  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const nextPath = sanitizeAdminNextPath(params.next);
  const loginHint = getAdminLoginHint();
  const credentialPreview = getAdminCredentialPreview();
  const noticeMessage =
    params.notice === "logged-out"
      ? "你已安全退出后台。"
      : params.notice === "session-expired"
        ? "登录已过期，请重新登录后继续操作。"
        : null;
  const errorMessage = resolveLoginErrorMessage(params.error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef2ef] px-6 py-10">
      <div className="w-full max-w-md rounded-[32px] border border-line bg-surface p-8 shadow-[0_16px_40px_rgba(24,50,57,0.08)]">
        <div className="space-y-4">
          <span className="inline-flex rounded-full bg-accent-soft px-4 py-2 text-sm font-medium text-accent">
            后台访问控制
          </span>
          <h1 className="font-serif text-3xl font-semibold text-foreground">
            登录中眠网管理后台
          </h1>
          <p className="text-sm leading-7 text-muted">
            后台已切换为最小可用鉴权模式。未登录用户不能直接访问后台主面板、内容管理、词条管理、品牌管理与
            AI 编辑部页面。
          </p>
        </div>

        {noticeMessage ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-7 text-emerald-700">
            {noticeMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-line bg-surface-soft px-4 py-3 text-sm leading-7 text-muted">
          <p className="font-medium text-foreground">{loginHint.title}</p>
          <p className="mt-2">{loginHint.description}</p>
          {credentialPreview ? (
            <div className="mt-3 space-y-1 rounded-2xl border border-dashed border-line bg-white px-4 py-3 text-xs leading-6 text-foreground/82">
              <p>开发环境默认账号：{credentialPreview.username}</p>
              <p>开发环境默认密码：{credentialPreview.password}</p>
            </div>
          ) : null}
        </div>

        <form action="/admin/login/submit" method="post" className="mt-8 space-y-4">
          <input type="hidden" name="next" value={nextPath} />

          <div className="space-y-2">
            <label
              htmlFor="username"
              className="text-sm font-medium text-foreground"
            >
              后台账号
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className="h-12 w-full rounded-2xl border border-line bg-surface-soft px-4 text-sm text-foreground outline-none transition focus:border-brand"
              placeholder="请输入后台账号"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              后台密码
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="h-12 w-full rounded-2xl border border-line bg-surface-soft px-4 text-sm text-foreground outline-none transition focus:border-brand"
              placeholder="请输入后台密码"
            />
          </div>

          <button
            type="submit"
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-brand font-medium text-white transition hover:bg-brand-strong"
          >
            登录后台
          </button>
        </form>
      </div>
    </div>
  );
}
