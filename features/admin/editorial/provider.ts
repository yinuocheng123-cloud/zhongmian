/**
 * 文件说明：该文件实现 AI 编辑部生成器 provider 的统一入口。
 * 功能说明：集中管理默认 provider、provider 查询与执行逻辑，避免任务流程直接依赖具体生成实现。
 *
 * 结构概览：
 *   第一部分：provider 注册表
 *   第二部分：provider 查询与执行入口
 */

import "server-only";

import { placeholderGenerationProvider } from "@/features/admin/editorial/providers/placeholder";
import type {
  AiGenerationProvider,
  AiGenerationProviderId,
  AiGenerationRequest,
} from "@/features/admin/editorial/types";

export const defaultAiGenerationProviderId: AiGenerationProviderId =
  "placeholder-mock";

const aiGenerationProviders: Record<AiGenerationProviderId, AiGenerationProvider> = {
  "placeholder-mock": placeholderGenerationProvider,
};

export function getAiGenerationProvider(providerId?: AiGenerationProviderId) {
  return aiGenerationProviders[providerId ?? defaultAiGenerationProviderId];
}

export async function executeAiGeneration(
  request: AiGenerationRequest,
  providerId?: AiGenerationProviderId,
) {
  const provider = getAiGenerationProvider(providerId);
  return provider.generate(request);
}
