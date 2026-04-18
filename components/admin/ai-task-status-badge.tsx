/**
 * 文件说明：该文件实现 AI 编辑部任务状态徽标组件。
 * 功能说明：统一展示 AiTask 的任务状态，避免列表页与编辑页重复维护样式映射。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：状态徽标组件
 */

import type { AiTaskStatus } from "@prisma/client";
import {
  aiTaskStatusClasses,
  aiTaskStatusLabels,
} from "@/features/admin/editorial/constants";

type AiTaskStatusBadgeProps = {
  status: AiTaskStatus;
};

export function AiTaskStatusBadge({ status }: AiTaskStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${aiTaskStatusClasses[status]}`}
    >
      {aiTaskStatusLabels[status]}
    </span>
  );
}
