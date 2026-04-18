/**
 * 文件说明：该文件实现中眠网后台主面板路由的公共布局。
 * 功能说明：为后台页面统一包裹导航与容器，并强制采用动态渲染，避免后台数据被静态固化。
 *
 * 结构概览：
 *   第一部分：布局配置
 *   第二部分：布局组件实现
 */

import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminShell
      title="后台内容生产闭环"
      description="当前阶段优先打通 Content、Term、Brand 三条主线的真实录入、保存、状态流转与过程记录，为后续前台详情页和 AI 编辑部接入打底。"
    >
      {children}
    </AdminShell>
  );
}
