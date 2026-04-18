/**
 * 文件说明：该文件实现中眠网前台门户页脚骨架。
 * 功能说明：展示一期定位、后续扩展方向与演示阶段声明。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：页脚组件实现
 */

import Link from "next/link";
import { siteNav } from "@/lib/demo-data";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line bg-brand-strong text-white">
      <div className="portal-shell grid gap-10 py-12 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <h2 className="font-serif text-2xl font-semibold">中眠网 Demo</h2>
          <p className="max-w-xl text-sm leading-7 text-white/78">
            当前版本用于确认门户信息结构、频道感觉与后台骨架方向。
            下一阶段再进入 Prisma Schema、权限体系、表单与 AI 工作流细节开发。
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
            已开放栏目
          </h3>
          <div className="flex flex-col gap-2 text-sm text-white/82">
            {siteNav.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">
            预留扩展
          </h3>
          <ul className="space-y-2 text-sm text-white/82">
            <li>会员入驻</li>
            <li>中眠榜与中眠指数</li>
            <li>睡眠标准与中眠智库</li>
            <li>联盟、大会与智能体协作</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
