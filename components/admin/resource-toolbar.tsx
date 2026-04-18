/**
 * 文件说明：该文件实现后台资源列表页的搜索和入口工具栏。
 * 功能说明：统一提供搜索、状态筛选与“新建资源”入口，为后续扩展分类、标签和高级筛选保留结构。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：工具栏组件
 */

import Link from "next/link";
import {
  resourceLabels,
  workflowFilterOptions,
  type ResourceKind,
} from "@/features/admin/resources/constants";

type ResourceToolbarProps = {
  resource: ResourceKind;
  q?: string;
  status?: string;
};

export function ResourceToolbar({
  resource,
  q = "",
  status = "",
}: ResourceToolbarProps) {
  const label = resourceLabels[resource];

  return (
    <div className="rounded-[28px] border border-line bg-surface-soft p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            {label.plural}
          </h2>
          <p className="text-sm leading-7 text-muted">
            当前提供基础搜索与状态筛选结构，后续可以继续接入分类、标签与更多高级筛选。
          </p>
        </div>
        <Link
          href={label.newPath}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-medium text-white transition hover:bg-brand-strong"
        >
          新建{label.singular}
        </Link>
      </div>

      <form className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px_120px]">
        <label className="flex flex-col gap-2 text-sm text-foreground">
          <span>搜索</span>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={`按${label.singular}标题、名称或 slug 搜索`}
            className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-foreground">
          <span>状态</span>
          <select
            name="status"
            defaultValue={status}
            className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
          >
            <option value="">全部状态</option>
            {workflowFilterOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          className="h-11 rounded-2xl border border-line bg-white px-5 text-sm font-medium text-foreground transition hover:border-brand hover:text-brand"
        >
          应用筛选
        </button>
      </form>
    </div>
  );
}
