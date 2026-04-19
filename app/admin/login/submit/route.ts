/**
 * 文件说明：该文件实现中眠网后台最小鉴权的登录提交路由。
 * 功能说明：负责接收后台用户名密码表单、校验凭证、写入 session cookie，并按来源跳转到后台页面。
 *
 * 结构概览：
 *   第一部分：导入依赖与基础配置
 *   第二部分：登录失败跳转辅助
 *   第三部分：POST 登录处理
 */

import { type NextRequest, NextResponse } from "next/server";
import {
  createAdminSession,
  sanitizeAdminNextPath,
  verifyAdminCredentials,
} from "@/features/admin/auth/session";

function buildLoginRedirectUrl(
  request: NextRequest,
  nextPath: string,
  errorCode?: string,
) {
  const redirectUrl = new URL("/admin/login", request.url);
  redirectUrl.searchParams.set("next", nextPath);

  if (errorCode) {
    redirectUrl.searchParams.set("error", errorCode);
  }

  return redirectUrl;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();
  const nextPath = sanitizeAdminNextPath(String(formData.get("next") ?? ""));

  if (!username || !password) {
    return NextResponse.redirect(buildLoginRedirectUrl(request, nextPath, "missing"));
  }

  const result = verifyAdminCredentials(username, password);

  if (!result.ok) {
    const errorCode = result.message.includes("配置缺失") ? "unavailable" : "invalid";
    return NextResponse.redirect(buildLoginRedirectUrl(request, nextPath, errorCode));
  }

  await createAdminSession(result.username);
  return NextResponse.redirect(new URL(nextPath, request.url));
}
