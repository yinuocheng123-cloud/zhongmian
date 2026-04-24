/**
 * 文件说明：该文件实现后台列表页的统一空状态组件。
 * 功能说明：负责承载“暂无数据”和“未找到结果”两类提示，并给出清空筛选或去新建的下一步入口。
 *
 * 结构概览：
 *   第一部分：依赖导入
 *   第二部分：后台列表空状态组件
 */

import Link from "next/link";

type AdminListEmptyStateProps = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

export function AdminListEmptyState({
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: AdminListEmptyStateProps) {
  return (
    <div className="px-6 py-12">
      <div className="rounded-[28px] border border-dashed border-line bg-surface-soft px-6 py-8 text-center">
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="mt-3 text-sm leading-7 text-muted">{description}</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={primaryHref}
            className="inline-flex rounded-2xl bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-strong"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex rounded-2xl border border-line px-4 py-2 text-sm font-medium text-foreground transition hover:border-brand hover:text-brand"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
