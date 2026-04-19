/**
 * 文件说明：该文件实现后台表单的共享字段组件。
 * 功能说明：统一输入框、文本域、下拉框、日期时间输入与分类标签多选组的结构，保证各后台表单的交互一致。
 *
 * 结构概览：
 *   第一部分：字段容器
 *   第二部分：基础输入类组件
 *   第三部分：多选类组件
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

type CheckboxOption = {
  label: string;
  value: string;
  description?: string | null;
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

export function AdminDateTimeInput(props: FieldProps) {
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
        type="datetime-local"
        defaultValue={props.defaultValue}
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

export function AdminCheckboxGroup({
  label,
  name,
  options,
  defaultValues = [],
  description,
  error,
  emptyMessage,
}: {
  label: string;
  name: string;
  options: CheckboxOption[];
  defaultValues?: string[];
  description?: string;
  error?: string;
  emptyMessage?: string;
}) {
  return (
    <div className="flex flex-col gap-3 text-sm text-foreground">
      <span className="font-medium">{label}</span>
      {description ? <span className="text-xs text-muted">{description}</span> : null}

      {options.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-start gap-3 rounded-2xl border border-line bg-surface-soft px-4 py-3"
            >
              <input
                type="checkbox"
                name={name}
                value={option.value}
                defaultChecked={defaultValues.includes(option.value)}
                className="mt-1 h-4 w-4 rounded border-line text-brand focus:ring-brand"
              />
              <span className="min-w-0">
                <span className="block font-medium text-foreground">{option.label}</span>
                {option.description ? (
                  <span className="mt-1 block text-xs leading-6 text-muted">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-line bg-surface-soft px-4 py-4 text-sm text-muted">
          {emptyMessage ?? "当前还没有可选项。"}
        </div>
      )}

      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}
