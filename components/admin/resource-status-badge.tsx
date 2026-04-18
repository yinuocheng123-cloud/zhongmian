/**
 * 文件说明：该文件实现后台资源状态徽标组件。
 * 功能说明：统一展示 Content / Term / Brand 的工作流状态，方便列表页与表单页复用。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：状态徽标组件
 */

import type { WorkflowStatus } from "@prisma/client";
import {
  workflowStatusClasses,
  workflowStatusLabels,
} from "@/features/admin/resources/constants";

type ResourceStatusBadgeProps = {
  status: WorkflowStatus;
};

export function ResourceStatusBadge({ status }: ResourceStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${workflowStatusClasses[status]}`}
    >
      {workflowStatusLabels[status]}
    </span>
  );
}
