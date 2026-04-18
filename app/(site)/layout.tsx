/**
 * 文件说明：该文件实现中眠网前台站点级布局。
 * 功能说明：为前台页面统一注入导航、主体容器和页脚。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：站点布局实现
 */

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 py-10">{children}</main>
      <SiteFooter />
    </>
  );
}
