/**
 * 文件说明：该文件实现后台通用提示组件。
 * 功能说明：统一承载成功提示、错误提示和数据库不可用提示，减少页面样式重复。
 *
 * 结构概览：
 *   第一部分：组件实现
 */

type AdminNoticeProps = {
  tone?: "info" | "error" | "success";
  title: string;
  description: string;
};

const toneClassMap: Record<NonNullable<AdminNoticeProps["tone"]>, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-800",
  error: "border-rose-200 bg-rose-50 text-rose-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export function AdminNotice({
  tone = "info",
  title,
  description,
}: AdminNoticeProps) {
  return (
    <div className={`rounded-[24px] border p-5 ${toneClassMap[tone]}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-7">{description}</p>
    </div>
  );
}
