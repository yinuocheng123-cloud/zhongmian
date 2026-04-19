/**
 * 文件说明：该文件实现 AI 编辑部默认的占位生成 provider。
 * 功能说明：在不接入真实模型的前提下，基于模板和结构化输入生成稳定的 mock 结果，作为未来真实模型 provider 的替换基线。
 *
 * 结构概览：
 *   第一部分：元信息与摘要工具
 *   第二部分：placeholder provider 实现
 */

import {
  buildPromptFromTemplate,
  buildStructuredPlaceholderOutput,
} from "@/features/admin/editorial/templates";
import type {
  AiGenerationProvider,
  AiGenerationRequest,
  AiGenerationResult,
} from "@/features/admin/editorial/types";

function buildExcerpt(text: string) {
  const plainText = text.replace(/\s+/g, " ").trim();
  return plainText.slice(0, 120);
}

function buildGenerationMeta(request: AiGenerationRequest) {
  return {
    providerId: "placeholder-mock" as const,
    providerName: "Placeholder Mock Provider",
    templateId: request.template.id,
    templateName: request.template.name,
    generatedAt: new Date().toISOString(),
    isMock: true,
  };
}

async function generatePlaceholderResult(
  request: AiGenerationRequest,
): Promise<AiGenerationResult> {
  const prompt = buildPromptFromTemplate(request.template, request.input);
  const meta = buildGenerationMeta(request);

  try {
    const renderedOutput = buildStructuredPlaceholderOutput(
      request.template,
      request.input,
    );

    return {
      status: "SUCCEEDED",
      text: renderedOutput.text,
      excerpt: buildExcerpt(renderedOutput.text),
      prompt,
      meta,
      outputJson: {
        schemaVersion: "v2",
        meta,
        input: request.input,
        sections: renderedOutput.sections,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Provider 执行失败，未能生成占位结果。";

    return {
      status: "FAILED",
      text: "",
      excerpt: "",
      prompt,
      meta,
      errorMessage,
      outputJson: {
        schemaVersion: "v2",
        meta,
        errorMessage,
      },
    };
  }
}

export const placeholderGenerationProvider: AiGenerationProvider = {
  id: "placeholder-mock",
  name: "Placeholder Mock Provider",
  generate: generatePlaceholderResult,
};
