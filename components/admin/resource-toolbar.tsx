/**
 * 文件说明：该文件实现后台资源列表页的搜索与入口工具栏。
 * 功能说明：统一提供搜索、状态筛选、内容类型筛选与新建入口，为内容、词条、品牌三类后台保持一致操作体验。
 *
 * 结构概览：
 *   第一部分：依赖导入
 *   第二部分：资源工具栏组件
 */

import Link from "next/link";
import {
  contentTypeOptions,
  resourceLabels,
  workflowFilterOptions,
  type ResourceKind,
} from "@/features/admin/resources/constants";

type ResourceToolbarProps = {
  resource: ResourceKind;
  q?: string;
  status?: string;
  contentType?: string;
};

export function ResourceToolbar({
  resource,
  q = "",
  status = "",
  contentType = "",
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
            当前提供搜索、状态筛选和前台联动入口，后续继续承接更细的运营动作，但不把后台做成过重的通用 CMS。
          </p>
        </div>
        <Link
          href={label.newPath}
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-brand px-5 text-sm font-medium text-white transition hover:bg-brand-strong"
        >
          新建{label.singular}
        </Link>
      </div>

      <form
        className={`mt-6 grid gap-4 ${
          resource === "content"
            ? "lg:grid-cols-[1fr_200px_200px_120px]"
            : "lg:grid-cols-[1fr_220px_120px]"
        }`}
      >
        <label className="flex flex-col gap-2 text-sm text-foreground">
          <span>搜索</span>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder={`按${label.singular}标题、名称、标签或 slug 搜索`}
            className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
          />
        </label>

        {resource === "content" ? (
          <label className="flex flex-col gap-2 text-sm text-foreground">
            <span>内容类型</span>
            <select
              name="contentType"
              defaultValue={contentType}
              className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
            >
              <option value="">全部类型</option>
              {contentTypeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

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
