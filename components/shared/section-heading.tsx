/**
 * 文件说明：该文件实现中眠网 demo 的通用分区标题组件。
 * 功能说明：统一前台和后台区块标题样式，减少页面层重复结构。
 *
 * 结构概览：
 *   第一部分：类型定义
 *   第二部分：组件实现
 */

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-brand">
        {eyebrow}
      </span>
      <div className="space-y-2">
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
