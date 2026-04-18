/**
 * 文件说明：该文件实现后台表单的提交按钮组件。
 * 功能说明：结合 useFormStatus 呈现提交中的状态，避免多次提交时缺少反馈。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：提交按钮组件
 */

"use client";

import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  intent: string;
  label: string;
  tone?: "primary" | "secondary" | "danger";
};

const toneClassMap: Record<NonNullable<FormSubmitButtonProps["tone"]>, string> = {
  primary: "bg-brand text-white hover:bg-brand-strong",
  secondary:
    "border border-line bg-white text-foreground hover:border-brand hover:text-brand",
  danger: "border border-rose-200 bg-rose-50 text-rose-700 hover:border-rose-300",
};

export function FormSubmitButton({
  intent,
  label,
  tone = "secondary",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${toneClassMap[tone]}`}
      disabled={pending}
    >
      {pending ? "处理中..." : label}
    </button>
  );
}
