/**
 * 文件说明：该文件实现后台表单的共享字段组件。
 * 功能说明：统一输入框、文本域和说明区的结构，保证 Content / Term / Brand 三套表单的交互一致。
 *
 * 结构概览：
 *   第一部分：基础字段容器
 *   第二部分：输入类组件
 */

import type { ReactNode } from "react";

type FieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  description?: string;
};

type SelectOption = {
  label: string;
  value: string;
};

function FieldShell({
  label,
  name,
  error,
  required,
  description,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  description?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2 text-sm text-foreground" htmlFor={name}>
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>
      {children}
      {description ? <span className="text-xs text-muted">{description}</span> : null}
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}

export function AdminInput(props: FieldProps) {
  return (
    <FieldShell
      label={props.label}
      name={props.name}
      error={props.error}
      required={props.required}
      description={props.description}
    >
      <input
        id={props.name}
        name={props.name}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
      />
    </FieldShell>
  );
}

export function AdminTextarea(props: FieldProps & { rows?: number }) {
  return (
    <FieldShell
      label={props.label}
      name={props.name}
      error={props.error}
      required={props.required}
      description={props.description}
    >
      <textarea
        id={props.name}
        name={props.name}
        defaultValue={props.defaultValue}
        placeholder={props.placeholder}
        rows={props.rows ?? 5}
        className="rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-brand"
      />
    </FieldShell>
  );
}

export function AdminSelect(
  props: FieldProps & {
    options: SelectOption[];
  },
) {
  return (
    <FieldShell
      label={props.label}
      name={props.name}
      error={props.error}
      required={props.required}
      description={props.description}
    >
      <select
        id={props.name}
        name={props.name}
        defaultValue={props.defaultValue}
        className="h-11 rounded-2xl border border-line bg-white px-4 outline-none transition focus:border-brand"
      >
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}
