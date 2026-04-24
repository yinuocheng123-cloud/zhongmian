/**
 * 文件说明：该文件实现后台结构化文本编辑器。
 * 功能说明：负责长文本编辑、Word/WPS 粘贴清洗、基础格式快捷操作、清理格式与实时预览。
 *
 * 结构概览：
 *   第一部分：粘贴内容清洗与结构化序列化
 *   第二部分：光标插入、包裹和格式整理工具
 *   第三部分：结构化文本编辑器组件
 */

"use client";

import type { ClipboardEvent, MouseEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { StructuredTextContent } from "@/components/shared/structured-text-content";

type StructuredTextEditorProps = {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  description?: string;
  rows?: number;
  previewTitle?: string;
};

function normalizeTextValue(value: string) {
  return value.replace(/\u00a0/g, " ").replace(/\r\n/g, "\n");
}

function collapseExtraBreaks(value: string) {
  return value
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return normalizeTextValue(node.textContent ?? "");
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  const tagName = element.tagName.toLowerCase();
  const childText = Array.from(element.childNodes)
    .map((child) => serializeNode(child))
    .join("");

  if (["style", "script", "meta", "link", "xml"].includes(tagName)) {
    return "";
  }

  if (tagName === "br") {
    return "\n";
  }

  if (tagName === "strong" || tagName === "b") {
    return childText.trim() ? `**${childText.trim()}**` : "";
  }

  if (tagName === "em" || tagName === "i") {
    return childText.trim() ? `*${childText.trim()}*` : "";
  }

  if (tagName === "h1" || tagName === "h2") {
    return childText.trim() ? `## ${childText.trim()}\n\n` : "";
  }

  if (
    tagName === "h3" ||
    tagName === "h4" ||
    tagName === "h5" ||
    tagName === "h6"
  ) {
    return childText.trim() ? `### ${childText.trim()}\n\n` : "";
  }

  if (tagName === "li") {
    return childText.trim();
  }

  if (tagName === "ul" || tagName === "ol") {
    const items = Array.from(element.children)
      .filter((child) => child.tagName.toLowerCase() === "li")
      .map((child, index) => {
        const itemText = collapseExtraBreaks(serializeNode(child));
        if (!itemText) {
          return "";
        }

        return tagName === "ol" ? `${index + 1}. ${itemText}` : `- ${itemText}`;
      })
      .filter(Boolean)
      .join("\n");

    return items ? `${items}\n\n` : "";
  }

  if (tagName === "table") {
    const rows = Array.from(element.querySelectorAll("tr"))
      .map((row) =>
        Array.from(row.querySelectorAll("th,td"))
          .map((cell) => collapseExtraBreaks(serializeNode(cell)))
          .filter(Boolean)
          .join(" | "),
      )
      .filter(Boolean)
      .join("\n");

    return rows ? `${rows}\n\n` : "";
  }

  if (
    [
      "p",
      "div",
      "section",
      "article",
      "header",
      "footer",
      "blockquote",
      "tr",
      "td",
      "th",
    ].includes(tagName)
  ) {
    return childText.trim() ? `${childText.trim()}\n\n` : "";
  }

  return childText;
}

function normalizePastedHtml(html: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const serialized = Array.from(document.body.childNodes)
    .map((node) => serializeNode(node))
    .join("");

  return collapseExtraBreaks(serialized);
}

function normalizePlainTextPaste(text: string) {
  return collapseExtraBreaks(normalizeTextValue(text));
}

export function StructuredTextEditor({
  label,
  name,
  defaultValue = "",
  placeholder,
  error,
  required,
  description,
  rows = 12,
  previewTitle = "结构化预览",
}: StructuredTextEditorProps) {
  const [value, setValue] = useState(defaultValue);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const normalizedInitialValue = useMemo(
    () => normalizePlainTextPaste(defaultValue),
    [defaultValue],
  );
  const isDirty = normalizePlainTextPaste(value) !== normalizedInitialValue;

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function updateValue(nextValue: string, selectionStart?: number, selectionEnd?: number) {
    setValue(nextValue);

    requestAnimationFrame(() => {
      if (!textareaRef.current) {
        return;
      }

      textareaRef.current.focus();

      if (
        typeof selectionStart === "number" &&
        typeof selectionEnd === "number"
      ) {
        textareaRef.current.setSelectionRange(selectionStart, selectionEnd);
      }
    });
  }

  function insertTextAtSelection(insertedText: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      setValue((currentValue) => `${currentValue}${insertedText}`);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const nextValue = value.slice(0, start) + insertedText + value.slice(end);
    const nextCursor = start + insertedText.length;

    updateValue(nextValue, nextCursor, nextCursor);
  }

  function wrapSelection(prefix: string, suffix: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.slice(start, end) || "请替换为正文";
    const nextValue =
      value.slice(0, start) +
      `${prefix}${selectedText}${suffix}` +
      value.slice(end);
    const selectionOffset = prefix.length;
    const selectionEnd = start + selectionOffset + selectedText.length;

    updateValue(nextValue, start + selectionOffset, selectionEnd);
  }

  function prefixSelectedLines(prefix: string) {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectionStart = value.lastIndexOf("\n", start - 1) + 1;
    const selectionEnd = value.indexOf("\n", end);
    const safeEnd = selectionEnd === -1 ? value.length : selectionEnd;
    const selectedBlock = value.slice(selectionStart, safeEnd);
    const nextBlock = selectedBlock
      .split("\n")
      .map((line) => (line.trim() ? `${prefix}${line}` : line))
      .join("\n");
    const nextValue =
      value.slice(0, selectionStart) +
      nextBlock +
      value.slice(safeEnd);

    updateValue(nextValue, selectionStart, selectionStart + nextBlock.length);
  }

  function insertNormalizedContent(normalized: string) {
    if (!normalized) {
      return;
    }

    const textarea = textareaRef.current;

    if (!textarea) {
      setValue((currentValue) => `${currentValue}\n\n${normalized}`.trim());
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prefix = start > 0 && !value.slice(0, start).endsWith("\n\n") ? "\n\n" : "";
    const suffix = end < value.length && !value.slice(end).startsWith("\n\n") ? "\n\n" : "";
    const nextText = `${prefix}${normalized}${suffix}`;
    const nextValue = value.slice(0, start) + nextText + value.slice(end);
    const nextCursor = start + nextText.length;

    updateValue(nextValue, nextCursor, nextCursor);
  }

  function handlePaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const html = event.clipboardData.getData("text/html");
    const plainText = event.clipboardData.getData("text/plain");
    const normalized = html.trim()
      ? normalizePastedHtml(html)
      : normalizePlainTextPaste(plainText);

    if (!normalized) {
      return;
    }

    event.preventDefault();
    insertNormalizedContent(normalized);
  }

  function handleCleanFormatting(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    updateValue(normalizePlainTextPaste(value));
  }

  return (
    <label className="flex flex-col gap-2 text-sm text-foreground" htmlFor={name}>
      <span className="font-medium">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : null}
      </span>

      <div className="rounded-[24px] border border-line bg-white p-3">
        <div className="flex flex-wrap gap-2 border-b border-line pb-3">
          <button
            type="button"
            onClick={() => prefixSelectedLines("## ")}
            className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
          >
            二级标题
          </button>
          <button
            type="button"
            onClick={() => prefixSelectedLines("### ")}
            className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
          >
            三级标题
          </button>
          <button
            type="button"
            onClick={() => prefixSelectedLines("- ")}
            className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
          >
            列表
          </button>
          <button
            type="button"
            onClick={() => wrapSelection("**", "**")}
            className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
          >
            加粗
          </button>
          <button
            type="button"
            onClick={() => wrapSelection("*", "*")}
            className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
          >
            斜体
          </button>
          <button
            type="button"
            onClick={() => insertTextAtSelection("\n\n")}
            className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
          >
            分段
          </button>
          <button
            type="button"
            onClick={handleCleanFormatting}
            className="rounded-xl border border-line px-3 py-2 text-xs font-medium text-foreground transition hover:border-brand hover:text-brand"
          >
            清理格式
          </button>
        </div>

        <textarea
          ref={textareaRef}
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          rows={rows}
          onChange={(event) => setValue(event.target.value)}
          onPaste={handlePaste}
          className="mt-3 w-full rounded-2xl border border-line bg-white px-4 py-3 outline-none transition focus:border-brand"
        />
      </div>

      <span className="text-xs text-muted">
        {description ??
          "支持从 Word / WPS 直接粘贴，系统会尽量保留标题、段落、列表、加粗和斜体，并自动清理冗余格式。"}
      </span>
      <span className="text-xs text-muted">
        {isDirty
          ? "当前内容尚未保存，直接离开页面会触发浏览器提醒。"
          : "当前内容已与页面初始值保持一致。"}
      </span>

      {error ? <span className="text-xs text-rose-600">{error}</span> : null}

      <div className="rounded-[24px] border border-dashed border-line bg-surface-soft p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {previewTitle}
        </p>
        <div className="mt-4">
          <StructuredTextContent
            value={value}
            emptyText="当前还没有可预览的正文内容。"
            className="space-y-4"
          />
        </div>
      </div>
    </label>
  );
}
