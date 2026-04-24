/**
 * 文件说明：该文件实现中眠网前台栏目页可复用的筛选、结果状态与分页控件。
 * 功能说明：统一处理 query 参数拼接、当前筛选条件展示、清空筛选入口与分页导航，减少三条栏目页重复代码。
 *
 * 结构概览：
 *   第一部分：类型与 query 参数工具
 *   第二部分：筛选入口与当前筛选组件
 *   第三部分：分页组件
 */

import Link from "next/link";

type QueryValue = string | number | null | undefined;

export type ListFilterItem = {
  label: string;
  value: string;
  count?: number;
};

type FilterGroupProps = {
  title: string;
  basePath: string;
  paramName: "category" | "tag";
  items: ListFilterItem[];
  searchParams: Record<string, string | undefined>;
  emptyLabel: string;
};

type ActiveFiltersProps = {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  labels?: Partial<Record<"q" | "category" | "tag", string>>;
};

type PaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
};

export function buildListHref(
  basePath: string,
  current: Record<string, string | undefined>,
  overrides: Record<string, QueryValue>,
) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    if (value) {
      params.set(key, value);
    }
  }

  for (const [key, value] of Object.entries(overrides)) {
    if (value === null || value === undefined || value === "") {
      params.delete(key);
      continue;
    }

    params.set(key, String(value));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function ListFilterGroup({
  title,
  basePath,
  paramName,
  items,
  searchParams,
  emptyLabel,
}: FilterGroupProps) {
  const activeValue = searchParams[paramName];
  const allHref = buildListHref(basePath, searchParams, {
    [paramName]: null,
    page: null,
  });

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="flex flex-wrap gap-2">
        <Link
          href={allHref}
          className={`rounded-full border px-3 py-1 text-sm transition ${
            !activeValue
              ? "border-brand bg-brand/10 text-brand"
              : "border-line bg-surface-soft text-muted hover:border-brand hover:text-brand"
          }`}
        >
          全部
        </Link>

        {items.length > 0 ? (
          items.map((item) => {
            const href = buildListHref(basePath, searchParams, {
              [paramName]: item.value,
              page: null,
            });

            return (
              <Link
                key={item.value}
                href={href}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  activeValue === item.value
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-line bg-surface-soft text-muted hover:border-brand hover:text-brand"
                }`}
              >
                {item.label}
                {typeof item.count === "number" ? ` · ${item.count}` : ""}
              </Link>
            );
          })
        ) : (
          <span className="rounded-full border border-dashed border-line px-3 py-1 text-sm text-muted">
            {emptyLabel}
          </span>
        )}
      </div>
    </div>
  );
}

export function ListActiveFilters({
  basePath,
  searchParams,
  labels,
}: ActiveFiltersProps) {
  const entries = Object.entries(searchParams).filter(
    ([key, value]) => key !== "page" && Boolean(value),
  );

  if (entries.length === 0) {
    return null;
  }

  const labelMap: Record<string, string> = {
    q: labels?.q ?? "搜索",
    category: labels?.category ?? "分类",
    tag: labels?.tag ?? "标签",
  };

  return (
    <div className="rounded-[24px] border border-line bg-white/80 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-foreground">当前筛选</span>
          {entries.map(([key, value]) => (
            <span
              key={key}
              className="rounded-full border border-line bg-surface-soft px-3 py-1 text-sm text-muted"
            >
              {labelMap[key] ?? key}：{value}
            </span>
          ))}
        </div>
        <Link
          href={basePath}
          className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-medium text-foreground transition hover:border-brand hover:text-brand"
        >
          清空筛选
        </Link>
      </div>
    </div>
  );
}

export function ListPagination({
  basePath,
  currentPage,
  totalPages,
  searchParams,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(0, currentPage - 3),
    Math.max(5, currentPage + 2),
  );

  const previousHref = buildListHref(basePath, searchParams, {
    page: currentPage > 1 ? currentPage - 1 : 1,
  });
  const nextHref = buildListHref(basePath, searchParams, {
    page: currentPage < totalPages ? currentPage + 1 : totalPages,
  });

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-line bg-white/80 p-5">
      <div className="text-sm text-muted">
        第 {currentPage} / {totalPages} 页
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={previousHref}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            currentPage === 1
              ? "pointer-events-none border-line bg-surface-soft text-muted/50"
              : "border-line bg-surface-soft text-foreground hover:border-brand hover:text-brand"
          }`}
        >
          上一页
        </Link>

        {pages.map((page) => (
          <Link
            key={page}
            href={buildListHref(basePath, searchParams, { page })}
            className={`rounded-full border px-4 py-2 text-sm transition ${
              page === currentPage
                ? "border-brand bg-brand/10 text-brand"
                : "border-line bg-surface-soft text-foreground hover:border-brand hover:text-brand"
            }`}
          >
            {page}
          </Link>
        ))}

        <Link
          href={nextHref}
          className={`rounded-full border px-4 py-2 text-sm transition ${
            currentPage === totalPages
              ? "pointer-events-none border-line bg-surface-soft text-muted/50"
              : "border-line bg-surface-soft text-foreground hover:border-brand hover:text-brand"
          }`}
        >
          下一页
        </Link>
      </div>
    </div>
  );
}
