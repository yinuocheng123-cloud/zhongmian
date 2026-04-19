/**
 * 文件说明：该文件实现中眠网后台主面板路由的公共布局。
 * 功能说明：统一包裹后台页面容器，并在进入后台主面板前执行最小登录校验。
 *
 * 结构概览：
 *   第一部分：布局配置
 *   第二部分：布局组件实现
 */

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminSession } from "@/features/admin/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminSession("/admin");

  return (
    <AdminShell
      title="后台内容生产闭环"
      description="当前阶段优先打通 Content、Term、Brand 三条主线的真实录入、保存、状态流转与过程记录，并在最小鉴权保护下支撑正式后台使用。"
    >
      {children}
    </AdminShell>
  );
}
