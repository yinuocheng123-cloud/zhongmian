/**
 * 文件说明：该文件实现后台资源管理的服务端提交动作。
 * 功能说明：统一处理 Content / Term / Brand 的新增、编辑、校验与状态流转，并为工作流与版本记录保留稳定入口。
 *
 * 结构概览：
 *   第一部分：基础校验与公共辅助
 *   第二部分：工作流与版本记录辅助
 *   第三部分：三类资源保存动作
 */

"use server";

import {
  ContentType,
  type Prisma,
  type WorkflowStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  intentLabels,
  resourceLabels,
  type ResourceFormIntent,
} from "@/features/admin/resources/constants";
import type { ResourceFormState } from "@/features/admin/resources/types";
import {
  buildWorkflowNote,
  getErrorMessage,
  parseAliases,
  resolvePublishedAt,
  resolveWorkflowStatus,
  slugify,
} from "@/features/admin/resources/utils";
import { prisma } from "@/lib/prisma";

function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function buildFieldErrorState(
  message: string,
  fieldErrors: Record<string, string>,
): ResourceFormState {
  return {
    status: "error",
    message,
    fieldErrors,
  };
}

function ensureIntent(formData: FormData): ResourceFormIntent {
  const intent = formData.get("intent");

  if (
    intent === "SAVE" ||
    intent === "SAVE_DRAFT" ||
    intent === "SUBMIT_REVIEW" ||
    intent === "PUBLISH" ||
    intent === "UNPUBLISH"
  ) {
    return intent;
  }

  return "SAVE";
}

function getActorName() {
  // 当前阶段尚未接入真实鉴权，先使用稳定操作者占位，便于后续替换。
  return "admin-demo-user";
}

function ensureDatabaseReady() {
  if (!process.env.DATABASE_URL) {
    throw new Error("未配置 DATABASE_URL，当前无法执行真实保存。");
  }
}

async function ensureUniqueSlug(
  tx: Prisma.TransactionClient,
  kind: "content" | "term" | "brand",
  slug: string,
  currentId?: string,
) {
  const where = currentId
    ? { slug, NOT: { id: currentId } }
    : { slug };

  const existing =
    kind === "content"
      ? await tx.content.findFirst({ where, select: { id: true } })
      : kind === "term"
        ? await tx.term.findFirst({ where, select: { id: true } })
        : await tx.brand.findFirst({ where, select: { id: true } });

  return !existing;
}

async function createWorkflowLog(
  tx: Prisma.TransactionClient,
  params: {
    targetType: "CONTENT" | "TERM" | "BRAND";
    toStatus: WorkflowStatus;
    fromStatus?: WorkflowStatus | null;
    note: string;
    actorName: string;
    contentId?: string;
    termId?: string;
    brandId?: string;
  },
) {
  const hasStatusChanged = params.fromStatus !== params.toStatus;
  const isInitialLog = params.fromStatus == null;

  if (!hasStatusChanged && !isInitialLog) {
    return;
  }

  await tx.workflow.create({
    data: {
      targetType: params.targetType,
      fromStatus: params.fromStatus ?? null,
      toStatus: params.toStatus,
      note: params.note,
      actorName: params.actorName,
      contentId: params.contentId,
      termId: params.termId,
      brandId: params.brandId,
    },
  });
}

async function createContentVersion(
  tx: Prisma.TransactionClient,
  params: {
    contentId: string;
    title: string;
    summary: string;
    body: string;
    createdBy: string;
    changeNote: string;
  },
) {
  const latestVersion = await tx.contentVersion.findFirst({
    where: { contentId: params.contentId },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });

  await tx.contentVersion.create({
    data: {
      contentId: params.contentId,
      versionNumber: (latestVersion?.versionNumber ?? 0) + 1,
      titleSnapshot: params.title,
      summarySnapshot: params.summary,
      bodySnapshot: params.body,
      changeNote: params.changeNote,
      createdBy: params.createdBy,
    },
  });
}

export async function saveContentAction(
  contentId: string | null,
  _prevState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  try {
    ensureDatabaseReady();

    const title = getTrimmedValue(formData, "title");
    const rawSlug = getTrimmedValue(formData, "slug");
    const slug = slugify(rawSlug || title);
    const summary = getTrimmedValue(formData, "summary");
    const body = getTrimmedValue(formData, "body");
    const contentType = getTrimmedValue(formData, "contentType") as ContentType;
    const intent = ensureIntent(formData);

    const fieldErrors: Record<string, string> = {};

    if (!title) fieldErrors.title = "标题不能为空。";
    if (!slug) fieldErrors.slug = "Slug 不能为空。";
    if (!summary) fieldErrors.summary = "摘要不能为空。";
    if (!body) fieldErrors.body = "正文不能为空。";
    if (!Object.values(ContentType).includes(contentType)) {
      fieldErrors.contentType = "请选择合法的内容类型。";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return buildFieldErrorState("请先修正内容表单中的必填项。", fieldErrors);
    }

    const actorName = getActorName();

    const saved = await prisma.$transaction(async (tx) => {
      const isUniqueSlug = await ensureUniqueSlug(
        tx,
        "content",
        slug,
        contentId ?? undefined,
      );

      if (!isUniqueSlug) {
        throw buildFieldErrorState("Slug 已存在，请更换。", {
          slug: "当前 slug 已被其他内容占用。",
        });
      }

      const existing = contentId
        ? await tx.content.findUnique({
            where: { id: contentId },
            select: { id: true, workflowStatus: true, publishedAt: true },
          })
        : null;

      const nextStatus = resolveWorkflowStatus(intent, existing?.workflowStatus);
      const publishedAt = resolvePublishedAt(nextStatus, existing?.publishedAt);

      const content = existing
        ? await tx.content.update({
            where: { id: existing.id },
            data: {
              title,
              slug,
              summary,
              body,
              contentType,
              workflowStatus: nextStatus,
              publishedAt,
            },
          })
        : await tx.content.create({
            data: {
              title,
              slug,
              summary,
              body,
              contentType,
              workflowStatus: nextStatus,
              publishedAt,
              seoKeywords: [],
            },
          });

      await createWorkflowLog(tx, {
        targetType: "CONTENT",
        fromStatus: existing?.workflowStatus,
        toStatus: nextStatus,
        note: buildWorkflowNote(intent, nextStatus),
        actorName,
        contentId: content.id,
      });

      await createContentVersion(tx, {
        contentId: content.id,
        title,
        summary,
        body,
        createdBy: actorName,
        changeNote: `${intentLabels[intent]}：${resourceLabels.content.singular}`,
      });

      return content;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/content");
    revalidatePath(`/admin/content/${saved.id}`);
    redirect(
      `/admin/content/${saved.id}?notice=${encodeURIComponent(intentLabels[intent])}`,
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === "error"
    ) {
      return error as ResourceFormState;
    }

    return { status: "error", message: getErrorMessage(error) };
  }
}

export async function saveTermAction(
  termId: string | null,
  _prevState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  try {
    ensureDatabaseReady();

    const name = getTrimmedValue(formData, "name");
    const rawSlug = getTrimmedValue(formData, "slug");
    const slug = slugify(rawSlug || name);
    const aliases = getTrimmedValue(formData, "aliases");
    const shortDefinition = getTrimmedValue(formData, "shortDefinition");
    const definition = getTrimmedValue(formData, "definition");
    const body = getTrimmedValue(formData, "body");
    const intent = ensureIntent(formData);

    const fieldErrors: Record<string, string> = {};

    if (!name) fieldErrors.name = "词条名称不能为空。";
    if (!slug) fieldErrors.slug = "Slug 不能为空。";
    if (!definition) fieldErrors.definition = "标准定义不能为空。";

    if (Object.keys(fieldErrors).length > 0) {
      return buildFieldErrorState("请先修正词条表单中的必填项。", fieldErrors);
    }

    const actorName = getActorName();

    const saved = await prisma.$transaction(async (tx) => {
      const isUniqueSlug = await ensureUniqueSlug(
        tx,
        "term",
        slug,
        termId ?? undefined,
      );

      if (!isUniqueSlug) {
        throw buildFieldErrorState("Slug 已存在，请更换。", {
          slug: "当前 slug 已被其他词条占用。",
        });
      }

      const existing = termId
        ? await tx.term.findUnique({
            where: { id: termId },
            select: { id: true, workflowStatus: true, publishedAt: true },
          })
        : null;

      const nextStatus = resolveWorkflowStatus(intent, existing?.workflowStatus);
      const publishedAt = resolvePublishedAt(nextStatus, existing?.publishedAt);

      const term = existing
        ? await tx.term.update({
            where: { id: existing.id },
            data: {
              name,
              slug,
              aliases: parseAliases(aliases),
              shortDefinition: shortDefinition || null,
              definition,
              body: body || null,
              workflowStatus: nextStatus,
              publishedAt,
            },
          })
        : await tx.term.create({
            data: {
              name,
              slug,
              aliases: parseAliases(aliases),
              shortDefinition: shortDefinition || null,
              definition,
              body: body || null,
              workflowStatus: nextStatus,
              publishedAt,
              seoKeywords: [],
            },
          });

      await createWorkflowLog(tx, {
        targetType: "TERM",
        fromStatus: existing?.workflowStatus,
        toStatus: nextStatus,
        note: buildWorkflowNote(intent, nextStatus),
        actorName,
        termId: term.id,
      });

      return term;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/terms");
    revalidatePath(`/admin/terms/${saved.id}`);
    redirect(
      `/admin/terms/${saved.id}?notice=${encodeURIComponent(intentLabels[intent])}`,
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === "error"
    ) {
      return error as ResourceFormState;
    }

    return { status: "error", message: getErrorMessage(error) };
  }
}

export async function saveBrandAction(
  brandId: string | null,
  _prevState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  try {
    ensureDatabaseReady();

    const name = getTrimmedValue(formData, "name");
    const rawSlug = getTrimmedValue(formData, "slug");
    const slug = slugify(rawSlug || name);
    const summary = getTrimmedValue(formData, "summary");
    const description = getTrimmedValue(formData, "description");
    const website = getTrimmedValue(formData, "website");
    const region = getTrimmedValue(formData, "region");
    const city = getTrimmedValue(formData, "city");
    const intent = ensureIntent(formData);

    const fieldErrors: Record<string, string> = {};

    if (!name) fieldErrors.name = "品牌名称不能为空。";
    if (!slug) fieldErrors.slug = "Slug 不能为空。";
    if (!summary) fieldErrors.summary = "摘要不能为空。";
    if (!description) fieldErrors.description = "品牌描述不能为空。";

    if (Object.keys(fieldErrors).length > 0) {
      return buildFieldErrorState("请先修正品牌表单中的必填项。", fieldErrors);
    }

    const actorName = getActorName();

    const saved = await prisma.$transaction(async (tx) => {
      const isUniqueSlug = await ensureUniqueSlug(
        tx,
        "brand",
        slug,
        brandId ?? undefined,
      );

      if (!isUniqueSlug) {
        throw buildFieldErrorState("Slug 已存在，请更换。", {
          slug: "当前 slug 已被其他品牌占用。",
        });
      }

      const existing = brandId
        ? await tx.brand.findUnique({
            where: { id: brandId },
            select: { id: true, workflowStatus: true, publishedAt: true },
          })
        : null;

      const nextStatus = resolveWorkflowStatus(intent, existing?.workflowStatus);
      const publishedAt = resolvePublishedAt(nextStatus, existing?.publishedAt);

      const brand = existing
        ? await tx.brand.update({
            where: { id: existing.id },
            data: {
              name,
              slug,
              summary,
              description,
              website: website || null,
              region: region || null,
              city: city || null,
              workflowStatus: nextStatus,
              publishedAt,
            },
          })
        : await tx.brand.create({
            data: {
              name,
              slug,
              summary,
              description,
              website: website || null,
              region: region || null,
              city: city || null,
              workflowStatus: nextStatus,
              publishedAt,
              seoKeywords: [],
            },
          });

      await createWorkflowLog(tx, {
        targetType: "BRAND",
        fromStatus: existing?.workflowStatus,
        toStatus: nextStatus,
        note: buildWorkflowNote(intent, nextStatus),
        actorName,
        brandId: brand.id,
      });

      return brand;
    });

    revalidatePath("/admin");
    revalidatePath("/admin/brands");
    revalidatePath(`/admin/brands/${saved.id}`);
    redirect(
      `/admin/brands/${saved.id}?notice=${encodeURIComponent(intentLabels[intent])}`,
    );
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === "error"
    ) {
      return error as ResourceFormState;
    }

    return { status: "error", message: getErrorMessage(error) };
  }
}
