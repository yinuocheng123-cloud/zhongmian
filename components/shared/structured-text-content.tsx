/**
 * 文件说明：该文件实现中眠网前后台共用的结构化文本渲染组件。
 * 功能说明：负责把后台编辑器保存的结构化文本标记渲染为标题、段落、列表和基础强调样式。
 *
 * 结构概览：
 *   第一部分：结构化文本解析工具
 *   第二部分：行内样式渲染
 *   第三部分：对外结构化文本组件
 */

import { Fragment } from "react";

type StructuredTextContentProps = {
  value?: string | null;
  emptyText?: string;
  className?: string;
};

type InlineToken =
  | {
      type: "text";
      value: string;
    }
  | {
      type: "bold";
      value: string;
    }
  | {
      type: "italic";
      value: string;
    };

type StructuredBlock =
  | {
      type: "heading";
      level: 2 | 3;
      text: string;
    }
  | {
      type: "paragraph";
      text: string;
    }
  | {
      type: "list";
      ordered: boolean;
      items: string[];
    };

function splitInlineTokens(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const matcher = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let cursor = 0;

  for (const match of text.matchAll(matcher)) {
    const matchedText = match[0];
    const startIndex = match.index ?? 0;

    if (startIndex > cursor) {
      tokens.push({
        type: "text",
        value: text.slice(cursor, startIndex),
      });
    }

    if (matchedText.startsWith("**") && matchedText.endsWith("**")) {
      tokens.push({
        type: "bold",
        value: matchedText.slice(2, -2),
      });
    } else {
      tokens.push({
        type: "italic",
        value: matchedText.slice(1, -1),
      });
    }

    cursor = startIndex + matchedText.length;
  }

  if (cursor < text.length) {
    tokens.push({
      type: "text",
      value: text.slice(cursor),
    });
  }

  return tokens;
}

function renderInlineText(text: string) {
  const tokens = splitInlineTokens(text);

  return tokens.map((token, index) => {
    const lines = token.value.split("\n");
    const renderedLines = lines.map((line, lineIndex) => (
      <Fragment key={`${token.type}-${index}-${lineIndex}`}>
        {lineIndex > 0 ? <br /> : null}
        {line}
      </Fragment>
    ));

    if (token.type === "bold") {
      return (
        <strong key={`${token.type}-${index}`} className="font-semibold text-foreground">
          {renderedLines}
        </strong>
      );
    }

    if (token.type === "italic") {
      return (
        <em key={`${token.type}-${index}`} className="italic">
          {renderedLines}
        </em>
      );
    }

    return <Fragment key={`${token.type}-${index}`}>{renderedLines}</Fragment>;
  });
}

function buildStructuredBlocks(value?: string | null): StructuredBlock[] {
  if (!value?.trim()) {
    return [];
  }

  const lines = value.replace(/\r\n/g, "\n").split("\n");
  const blocks: StructuredBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index]?.trim() ?? "";

    if (!line) {
      index += 1;
      continue;
    }

    const headingMatch = /^(#{2,3})\s+(.+)$/.exec(line);
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length === 2 ? 2 : 3,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    const unorderedMatch = /^[-*]\s+(.+)$/.exec(line);
    const orderedMatch = /^\d+\.\s+(.+)$/.exec(line);

    if (unorderedMatch || orderedMatch) {
      const ordered = Boolean(orderedMatch);
      const items: string[] = [];

      while (index < lines.length) {
        const currentLine = lines[index]?.trim() ?? "";
        const currentMatch = ordered
          ? /^\d+\.\s+(.+)$/.exec(currentLine)
          : /^[-*]\s+(.+)$/.exec(currentLine);

        if (!currentMatch) {
          break;
        }

        items.push(currentMatch[1].trim());
        index += 1;
      }

      blocks.push({
        type: "list",
        ordered,
        items,
      });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const currentLine = lines[index] ?? "";
      const trimmedLine = currentLine.trim();

      if (
        !trimmedLine ||
        /^(#{2,3})\s+/.test(trimmedLine) ||
        /^[-*]\s+/.test(trimmedLine) ||
        /^\d+\.\s+/.test(trimmedLine)
      ) {
        break;
      }

      paragraphLines.push(currentLine.trimEnd());
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      text: paragraphLines.join("\n").trim(),
    });
  }

  return blocks;
}

export function StructuredTextContent({
  value,
  emptyText = "当前还没有可展示的正文内容。",
  className = "space-y-5",
}: StructuredTextContentProps) {
  const blocks = buildStructuredBlocks(value);

  if (blocks.length === 0) {
    return (
      <p className="text-sm leading-7 text-muted sm:text-base">
        {emptyText}
      </p>
    );
  }

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 2) {
            return (
              <h2
                key={`heading-${index}`}
                className="font-serif text-2xl font-semibold text-foreground"
              >
                {renderInlineText(block.text)}
              </h2>
            );
          }

          return (
            <h3
              key={`heading-${index}`}
              className="text-lg font-semibold text-foreground"
            >
              {renderInlineText(block.text)}
            </h3>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";

          return (
            <ListTag
              key={`list-${index}`}
              className={`space-y-2 pl-5 text-sm leading-8 text-foreground/86 sm:text-base ${
                block.ordered ? "list-decimal" : "list-disc"
              }`}
            >
              {block.items.map((item, itemIndex) => (
                <li key={`list-item-${index}-${itemIndex}`}>
                  {renderInlineText(item)}
                </li>
              ))}
            </ListTag>
          );
        }

        return (
          <p
            key={`paragraph-${index}`}
            className="text-sm leading-8 text-foreground/86 sm:text-base"
          >
            {renderInlineText(block.text)}
          </p>
        );
      })}
    </div>
  );
}
