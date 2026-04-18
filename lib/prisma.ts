/**
 * 文件说明：该文件实现 Prisma Client 的单例占位封装。
 * 功能说明：为下一阶段接入 PostgreSQL 和数据模型时提供统一数据库入口。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：Prisma 单例导出
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
