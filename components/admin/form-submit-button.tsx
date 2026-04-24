/**
 * 文件说明：该文件实现后台表单与批量操作共用的提交按钮组件。
 * 功能说明：负责承载 useFormStatus 的提交中反馈，并在危险动作执行前给出最小二次确认。
 *
 * 结构概览：
 *   第一部分：依赖导入
 *   第二部分：按钮样式常量
 *   第三部分：提交按钮组件
 */

"use client";

import type { MouseEvent } from "react";
import { useFormStatus } from "react-dom";

type FormSubmitButtonProps = {
  intent: string;
  label: string;
  tone?: "primary" | "secondary" | "danger";
  form?: string;
  pendingLabel?: string;
  confirmTitle?: string;
  confirmDescription?: string;
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
  form,
  pendingLabel,
  confirmTitle,
  confirmDescription,
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!confirmTitle) {
      return;
    }

    const confirmed = window.confirm(
      confirmDescription
        ? `${confirmTitle}\n\n${confirmDescription}`
        : confirmTitle,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      name="intent"
      value={intent}
      form={form}
      onClick={handleClick}
      className={`rounded-2xl px-4 py-3 text-sm font-medium transition ${toneClassMap[tone]}`}
      disabled={pending}
    >
      {pending ? pendingLabel ?? "处理中..." : label}
    </button>
  );
}
