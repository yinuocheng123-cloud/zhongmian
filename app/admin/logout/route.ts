/**
 * 文件说明：该文件实现中眠网后台最小鉴权的登出提交路由。
 * 功能说明：负责清除后台登录态，并将用户安全跳转回后台登录页。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：POST 登出处理
 */

import { type NextRequest, NextResponse } from "next/server";
import { clearAdminSession } from "@/features/admin/auth/session";

export async function POST(request: NextRequest) {
  await clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login?notice=logged-out", request.url));
}
