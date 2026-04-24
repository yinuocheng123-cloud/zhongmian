/**
 * 文件说明：该文件实现后台资源管理模块的服务端提交流程。
 * 功能说明：统一处理 Content / Term / Brand 的保存、快速状态切换、工作流记录、分类标签更新与版本记录。
 *
 * 结构概览：
 *   第一部分：基础校验与公共辅助
 *   第二部分：Content / Term / Brand 保存动作
 *   第三部分：列表页快速状态切换动作
 */

"use server";

import {
  ContentType,
  type Prisma,
  type WorkflowStatus,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { redirect } from "next/navigation";
import {
  intentLabels,
  resourceLabels,
  type ResourceFormIntent,
  type ResourceKind,
} from "@/features/admin/resources/constants";
import {
  getAdminActorName,
  requireAdminSession,
} from "@/features/admin/auth/session";
import type { ResourceFormState } from "@/features/admin/resources/types";
import {
  buildWorkflowNote,
  buildPublicPath,
  getErrorMessage,
  getSuspiciousPublishReason,
  parseAliases,
  parseDateTimeInput,
  resolvePublishedAt,
  resolveWorkflowStatus,
  slugify,
} from "@/features/admin/resources/utils";
import { prisma } from "@/lib/prisma";

function getTrimmedValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getSelectedIds(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((item) => String(item).trim())
    .filter(Boolean);
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

function getResourceActionLabel(kind: ResourceKind, intent: ResourceFormIntent) {
  const resourceName = resourceLabels[kind].singular;

  const actionLabelMap: Record<ResourceFormIntent, string> = {
    SAVE: `${resourceName}已保存`,
    SAVE_DRAFT: `${resourceName}已保存为草稿`,
    SUBMIT_REVIEW: `${resourceName}已提交审核`,
    PUBLISH: `${resourceName}已发布，前台现在可见`,
    UNPUBLISH: `${resourceName}已下线，前台现在不可见`,
  };

  return actionLabelMap[intent];
}

function shouldEnforcePublishValidation(intent: ResourceFormIntent) {
  return intent === "SUBMIT_REVIEW" || intent === "PUBLISH";
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

function ensureDatabaseReady() {
  if (!process.env.DATABASE_URL) {
    throw new Error("未配置 DATABASE_URL，当前无法执行真实保存。");
  }
}

async function ensureUniqueSlug(
  tx: Prisma.TransactionClient,
  kind: ResourceKind,
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

function validatePublishingSafety(value: string) {
  const suspiciousReason = getSuspiciousPublishReason(value);

  if (!suspiciousReason) {
    return null;
  }

  return suspiciousReason;
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

function buildStatusActionRedirect(
  nextPath: string,
  feedback: {
    notice?: string;
    error?: string;
  },
) {
  const url = new URL(nextPath, "http://localhost");

  if (feedback.notice) {
    url.searchParams.set("notice", feedback.notice);
  }

  if (feedback.error) {
    url.searchParams.set("error", feedback.error);
  }

  return `${url.pathname}${url.search}`;
}

type StatusMutationIntent = Extract<
  ResourceFormIntent,
  "SAVE_DRAFT" | "SUBMIT_REVIEW" | "PUBLISH" | "UNPUBLISH"
>;

type DeleteResult = {
  id: string;
  slug: string | null;
};

function ensureStatusMutationIntent(value: FormDataEntryValue | null) {
  if (
    value === "SAVE_DRAFT" ||
    value === "SUBMIT_REVIEW" ||
    value === "PUBLISH" ||
    value === "UNPUBLISH"
  ) {
    return value;
  }

  return null;
}

function revalidateResourcePaths(kind: ResourceKind, id: string, slug?: string | null) {
  revalidatePath("/admin");
  revalidatePath(resourceLabels[kind].listPath);
  revalidatePath(`${resourceLabels[kind].listPath}/${id}`);

  revalidatePath("/");

  if (kind === "content") {
    revalidatePath("/knowledge");
  }

  if (kind === "term") {
    revalidatePath("/terms");
  }

  if (kind === "brand") {
    revalidatePath("/brands");
  }

  const publicPath = slug ? buildPublicPath(kind, slug) : null;

  if (publicPath) {
    revalidatePath(publicPath);
  }
}

type ContentSavePayload = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  contentType: ContentType;
  publishedAtInput: string;
  categoryIds: string[];
  tagIds: string[];
  intent: ResourceFormIntent;
};

async function saveContent(
  contentId: string | null,
  payload: ContentSavePayload,
) {
  const actorName = getAdminActorName();

  return prisma.$transaction(async (tx) => {
    const isUniqueSlug = await ensureUniqueSlug(
      tx,
      "content",
      payload.slug,
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

    const nextStatus = resolveWorkflowStatus(payload.intent, existing?.workflowStatus);
    const publishReason =
      nextStatus === "PUBLISHED"
        ? validatePublishingSafety(payload.title)
        : null;

    if (publishReason) {
      throw buildFieldErrorState(publishReason, {
        title: publishReason,
      });
    }

    const publishedAt = resolvePublishedAt({
      nextStatus,
      currentPublishedAt: existing?.publishedAt,
      requestedPublishedAt: parseDateTimeInput(payload.publishedAtInput),
    });

    const categoryConnections = payload.categoryIds.map((id) => ({ id }));
    const tagConnections = payload.tagIds.map((id) => ({ id }));

    const content = existing
      ? await tx.content.update({
          where: { id: existing.id },
          data: {
            title: payload.title,
            slug: payload.slug,
            summary: payload.summary,
            body: payload.body,
            contentType: payload.contentType,
            workflowStatus: nextStatus,
            publishedAt,
            categories: {
              set: categoryConnections,
            },
            tags: {
              set: tagConnections,
            },
          },
        })
      : await tx.content.create({
          data: {
            title: payload.title,
            slug: payload.slug,
            summary: payload.summary,
            body: payload.body,
            contentType: payload.contentType,
            workflowStatus: nextStatus,
            publishedAt,
            seoKeywords: [],
            categories: {
              connect: categoryConnections,
            },
            tags: {
              connect: tagConnections,
            },
          },
        });

    await createWorkflowLog(tx, {
      targetType: "CONTENT",
      fromStatus: existing?.workflowStatus,
      toStatus: nextStatus,
      note: buildWorkflowNote(payload.intent, nextStatus),
      actorName,
      contentId: content.id,
    });

    await createContentVersion(tx, {
      contentId: content.id,
      title: payload.title,
      summary: payload.summary,
      body: payload.body,
      createdBy: actorName,
      changeNote: `${intentLabels[payload.intent]}：${resourceLabels.content.singular}`,
    });

    return content;
  });
}

type TermSavePayload = {
  name: string;
  slug: string;
  aliases: string;
  shortDefinition: string;
  definition: string;
  body: string;
  publishedAtInput: string;
  categoryIds: string[];
  tagIds: string[];
  intent: ResourceFormIntent;
};

async function saveTerm(
  termId: string | null,
  payload: TermSavePayload,
) {
  const actorName = getAdminActorName();

  return prisma.$transaction(async (tx) => {
    const isUniqueSlug = await ensureUniqueSlug(
      tx,
      "term",
      payload.slug,
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

    const nextStatus = resolveWorkflowStatus(payload.intent, existing?.workflowStatus);
    const publishReason =
      nextStatus === "PUBLISHED"
        ? validatePublishingSafety(payload.name)
        : null;

    if (publishReason) {
      throw buildFieldErrorState(publishReason, {
        name: publishReason,
      });
    }

    const publishedAt = resolvePublishedAt({
      nextStatus,
      currentPublishedAt: existing?.publishedAt,
      requestedPublishedAt: parseDateTimeInput(payload.publishedAtInput),
    });

    const categoryConnections = payload.categoryIds.map((id) => ({ id }));
    const tagConnections = payload.tagIds.map((id) => ({ id }));

    const term = existing
      ? await tx.term.update({
          where: { id: existing.id },
          data: {
            name: payload.name,
            slug: payload.slug,
            aliases: parseAliases(payload.aliases),
            shortDefinition: payload.shortDefinition || null,
            definition: payload.definition,
            body: payload.body || null,
            workflowStatus: nextStatus,
            publishedAt,
            categories: {
              set: categoryConnections,
            },
            tags: {
              set: tagConnections,
            },
          },
        })
      : await tx.term.create({
          data: {
            name: payload.name,
            slug: payload.slug,
            aliases: parseAliases(payload.aliases),
            shortDefinition: payload.shortDefinition || null,
            definition: payload.definition,
            body: payload.body || null,
            workflowStatus: nextStatus,
            publishedAt,
            seoKeywords: [],
            categories: {
              connect: categoryConnections,
            },
            tags: {
              connect: tagConnections,
            },
          },
        });

    await createWorkflowLog(tx, {
      targetType: "TERM",
      fromStatus: existing?.workflowStatus,
      toStatus: nextStatus,
      note: buildWorkflowNote(payload.intent, nextStatus),
      actorName,
      termId: term.id,
    });

    return term;
  });
}

type BrandSavePayload = {
  name: string;
  slug: string;
  tagline: string;
  summary: string;
  description: string;
  website: string;
  region: string;
  city: string;
  publishedAtInput: string;
  categoryIds: string[];
  tagIds: string[];
  intent: ResourceFormIntent;
};

async function saveBrand(
  brandId: string | null,
  payload: BrandSavePayload,
) {
  const actorName = getAdminActorName();

  return prisma.$transaction(async (tx) => {
    const isUniqueSlug = await ensureUniqueSlug(
      tx,
      "brand",
      payload.slug,
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

    const nextStatus = resolveWorkflowStatus(payload.intent, existing?.workflowStatus);
    const publishReason =
      nextStatus === "PUBLISHED"
        ? validatePublishingSafety(payload.name)
        : null;

    if (publishReason) {
      throw buildFieldErrorState(publishReason, {
        name: publishReason,
      });
    }

    const publishedAt = resolvePublishedAt({
      nextStatus,
      currentPublishedAt: existing?.publishedAt,
      requestedPublishedAt: parseDateTimeInput(payload.publishedAtInput),
    });

    const categoryConnections = payload.categoryIds.map((id) => ({ id }));
    const tagConnections = payload.tagIds.map((id) => ({ id }));

    const brand = existing
      ? await tx.brand.update({
          where: { id: existing.id },
          data: {
            name: payload.name,
            slug: payload.slug,
            tagline: payload.tagline || null,
            summary: payload.summary,
            description: payload.description,
            website: payload.website || null,
            region: payload.region || null,
            city: payload.city || null,
            workflowStatus: nextStatus,
            publishedAt,
            categories: {
              set: categoryConnections,
            },
            tags: {
              set: tagConnections,
            },
          },
        })
      : await tx.brand.create({
          data: {
            name: payload.name,
            slug: payload.slug,
            tagline: payload.tagline || null,
            summary: payload.summary,
            description: payload.description,
            website: payload.website || null,
            region: payload.region || null,
            city: payload.city || null,
            workflowStatus: nextStatus,
            publishedAt,
            seoKeywords: [],
            categories: {
              connect: categoryConnections,
            },
            tags: {
              connect: tagConnections,
            },
          },
        });

    await createWorkflowLog(tx, {
      targetType: "BRAND",
      fromStatus: existing?.workflowStatus,
      toStatus: nextStatus,
      note: buildWorkflowNote(payload.intent, nextStatus),
      actorName,
      brandId: brand.id,
    });

    return brand;
  });
}

export async function saveContentAction(
  contentId: string | null,
  _prevState: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  await requireAdminSession(contentId ? `/admin/content/${contentId}` : "/admin/content/new");

  try {
    ensureDatabaseReady();

    const title = getTrimmedValue(formData, "title");
    const rawSlug = getTrimmedValue(formData, "slug");
    const slug = slugify(rawSlug || title);
    const summary = getTrimmedValue(formData, "summary");
    const body = getTrimmedValue(formData, "body");
    const contentType = getTrimmedValue(formData, "contentType") as ContentType;
    const publishedAtInput = getTrimmedValue(formData, "publishedAt");
    const categoryIds = getSelectedIds(formData, "categoryIds");
    const tagIds = getSelectedIds(formData, "tagIds");
    const intent = ensureIntent(formData);
    const enforcePublishValidation = shouldEnforcePublishValidation(intent);

    const fieldErrors: Record<string, string> = {};

    if (!title) fieldErrors.title = "标题不能为空。";
    if (!slug) fieldErrors.slug = "Slug 不能为空。";
    if (enforcePublishValidation && !summary) {
      fieldErrors.summary = "提交审核或发布前，请先补全摘要。";
    }
    if (enforcePublishValidation && !body) {
      fieldErrors.body = "提交审核或发布前，请先补全正文。";
    }
    if (!Object.values(ContentType).includes(contentType)) {
      fieldErrors.contentType = "请选择合法的内容类型。";
    }
    if (publishedAtInput && !parseDateTimeInput(publishedAtInput)) {
      fieldErrors.publishedAt = "发布时间格式无效，请重新选择。";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return buildFieldErrorState(
        enforcePublishValidation
          ? "当前内容还不完整，请先补全后再提交审核或发布。"
          : "请先修正内容表单中的必填项。",
        fieldErrors,
      );
    }

    const saved = await saveContent(contentId, {
      title,
      slug,
      summary,
      body,
      contentType,
      publishedAtInput,
      categoryIds,
      tagIds,
      intent,
    });

    revalidateResourcePaths("content", saved.id, saved.slug);
    redirect(
      `/admin/content/${saved.id}?notice=${encodeURIComponent(
        getResourceActionLabel("content", intent),
      )}`,
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

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
  await requireAdminSession(termId ? `/admin/terms/${termId}` : "/admin/terms/new");

  try {
    ensureDatabaseReady();

    const name = getTrimmedValue(formData, "name");
    const rawSlug = getTrimmedValue(formData, "slug");
    const slug = slugify(rawSlug || name);
    const aliases = getTrimmedValue(formData, "aliases");
    const shortDefinition = getTrimmedValue(formData, "shortDefinition");
    const definition = getTrimmedValue(formData, "definition");
    const body = getTrimmedValue(formData, "body");
    const publishedAtInput = getTrimmedValue(formData, "publishedAt");
    const categoryIds = getSelectedIds(formData, "categoryIds");
    const tagIds = getSelectedIds(formData, "tagIds");
    const intent = ensureIntent(formData);
    const enforcePublishValidation = shouldEnforcePublishValidation(intent);

    const fieldErrors: Record<string, string> = {};

    if (!name) fieldErrors.name = "词条名称不能为空。";
    if (!slug) fieldErrors.slug = "Slug 不能为空。";
    if (enforcePublishValidation && !shortDefinition) {
      fieldErrors.shortDefinition = "提交审核或发布前，请先补全一句话定义。";
    }
    if (enforcePublishValidation && !definition) {
      fieldErrors.definition = "提交审核或发布前，请先补全标准定义。";
    }
    if (publishedAtInput && !parseDateTimeInput(publishedAtInput)) {
      fieldErrors.publishedAt = "发布时间格式无效，请重新选择。";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return buildFieldErrorState(
        enforcePublishValidation
          ? "当前词条还不完整，请先补全后再提交审核或发布。"
          : "请先修正词条表单中的必填项。",
        fieldErrors,
      );
    }

    const saved = await saveTerm(termId, {
      name,
      slug,
      aliases,
      shortDefinition,
      definition,
      body,
      publishedAtInput,
      categoryIds,
      tagIds,
      intent,
    });

    revalidateResourcePaths("term", saved.id, saved.slug);
    redirect(
      `/admin/terms/${saved.id}?notice=${encodeURIComponent(
        getResourceActionLabel("term", intent),
      )}`,
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

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
  await requireAdminSession(brandId ? `/admin/brands/${brandId}` : "/admin/brands/new");

  try {
    ensureDatabaseReady();

    const name = getTrimmedValue(formData, "name");
    const rawSlug = getTrimmedValue(formData, "slug");
    const slug = slugify(rawSlug || name);
    const tagline = getTrimmedValue(formData, "tagline");
    const summary = getTrimmedValue(formData, "summary");
    const description = getTrimmedValue(formData, "description");
    const website = getTrimmedValue(formData, "website");
    const region = getTrimmedValue(formData, "region");
    const city = getTrimmedValue(formData, "city");
    const publishedAtInput = getTrimmedValue(formData, "publishedAt");
    const categoryIds = getSelectedIds(formData, "categoryIds");
    const tagIds = getSelectedIds(formData, "tagIds");
    const intent = ensureIntent(formData);
    const enforcePublishValidation = shouldEnforcePublishValidation(intent);

    const fieldErrors: Record<string, string> = {};

    if (!name) fieldErrors.name = "品牌名称不能为空。";
    if (!slug) fieldErrors.slug = "Slug 不能为空。";
    if (enforcePublishValidation && !summary) {
      fieldErrors.summary = "提交审核或发布前，请先补全品牌简介。";
    }
    if (enforcePublishValidation && !description) {
      fieldErrors.description = "提交审核或发布前，请先补全详细介绍。";
    }
    if (publishedAtInput && !parseDateTimeInput(publishedAtInput)) {
      fieldErrors.publishedAt = "发布时间格式无效，请重新选择。";
    }

    if (Object.keys(fieldErrors).length > 0) {
      return buildFieldErrorState(
        enforcePublishValidation
          ? "当前品牌信息还不完整，请先补全后再提交审核或发布。"
          : "请先修正品牌表单中的必填项。",
        fieldErrors,
      );
    }

    const saved = await saveBrand(brandId, {
      name,
      slug,
      tagline,
      summary,
      description,
      website,
      region,
      city,
      publishedAtInput,
      categoryIds,
      tagIds,
      intent,
    });

    revalidateResourcePaths("brand", saved.id, saved.slug);
    redirect(
      `/admin/brands/${saved.id}?notice=${encodeURIComponent(
        getResourceActionLabel("brand", intent),
      )}`,
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

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

async function updateResourceWorkflowStatus(
  kind: ResourceKind,
  resourceId: string,
  intent: StatusMutationIntent,
) {
  const actorName = getAdminActorName();

  return prisma.$transaction(async (tx) => {
    if (kind === "content") {
      const existing = await tx.content.findUnique({
        where: { id: resourceId },
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          body: true,
          workflowStatus: true,
          publishedAt: true,
        },
      });

      if (!existing) {
        throw new Error("内容不存在或已被删除。");
      }

      const nextStatus = resolveWorkflowStatus(intent, existing.workflowStatus);
      const publishReason =
        nextStatus === "PUBLISHED"
          ? validatePublishingSafety(existing.title)
          : null;

      if (publishReason) {
        throw new Error(publishReason);
      }

      const updated = await tx.content.update({
        where: { id: existing.id },
        data: {
          workflowStatus: nextStatus,
          publishedAt: resolvePublishedAt({
            nextStatus,
            currentPublishedAt: existing.publishedAt,
          }),
        },
        select: {
          id: true,
          slug: true,
          title: true,
          summary: true,
          body: true,
          workflowStatus: true,
        },
      });

      await createWorkflowLog(tx, {
        targetType: "CONTENT",
        fromStatus: existing.workflowStatus,
        toStatus: updated.workflowStatus,
        note: `列表页快速操作：${buildWorkflowNote(intent, updated.workflowStatus)}`,
        actorName,
        contentId: updated.id,
      });

      await createContentVersion(tx, {
        contentId: updated.id,
        title: updated.title,
        summary: updated.summary ?? "",
        body: updated.body ?? "",
        createdBy: actorName,
        changeNote: `列表页快速操作：${intentLabels[intent]}`,
      });

      return {
        id: updated.id,
        slug: updated.slug,
      };
    }

    if (kind === "term") {
      const existing = await tx.term.findUnique({
        where: { id: resourceId },
        select: {
          id: true,
          slug: true,
          name: true,
          workflowStatus: true,
          publishedAt: true,
        },
      });

      if (!existing) {
        throw new Error("词条不存在或已被删除。");
      }

      const nextStatus = resolveWorkflowStatus(intent, existing.workflowStatus);
      const publishReason =
        nextStatus === "PUBLISHED"
          ? validatePublishingSafety(existing.name)
          : null;

      if (publishReason) {
        throw new Error(publishReason);
      }

      const updated = await tx.term.update({
        where: { id: existing.id },
        data: {
          workflowStatus: nextStatus,
          publishedAt: resolvePublishedAt({
            nextStatus,
            currentPublishedAt: existing.publishedAt,
          }),
        },
        select: {
          id: true,
          slug: true,
          workflowStatus: true,
        },
      });

      await createWorkflowLog(tx, {
        targetType: "TERM",
        fromStatus: existing.workflowStatus,
        toStatus: updated.workflowStatus,
        note: `列表页快速操作：${buildWorkflowNote(intent, updated.workflowStatus)}`,
        actorName,
        termId: updated.id,
      });

      return {
        id: updated.id,
        slug: updated.slug,
      };
    }

    const existing = await tx.brand.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        slug: true,
        name: true,
        workflowStatus: true,
        publishedAt: true,
      },
    });

    if (!existing) {
      throw new Error("品牌不存在或已被删除。");
    }

    const nextStatus = resolveWorkflowStatus(intent, existing.workflowStatus);
    const publishReason =
      nextStatus === "PUBLISHED"
        ? validatePublishingSafety(existing.name)
        : null;

    if (publishReason) {
      throw new Error(publishReason);
    }

    const updated = await tx.brand.update({
      where: { id: existing.id },
      data: {
        workflowStatus: nextStatus,
        publishedAt: resolvePublishedAt({
          nextStatus,
          currentPublishedAt: existing.publishedAt,
        }),
      },
      select: {
        id: true,
        slug: true,
        workflowStatus: true,
      },
    });

    await createWorkflowLog(tx, {
      targetType: "BRAND",
      fromStatus: existing.workflowStatus,
      toStatus: updated.workflowStatus,
      note: `列表页快速操作：${buildWorkflowNote(intent, updated.workflowStatus)}`,
      actorName,
      brandId: updated.id,
    });

    return {
      id: updated.id,
      slug: updated.slug,
    };
  });
}

async function deleteResource(
  kind: ResourceKind,
  resourceId: string,
): Promise<DeleteResult> {
  return prisma.$transaction(async (tx) => {
    if (kind === "content") {
      const existing = await tx.content.findUnique({
        where: { id: resourceId },
        select: {
          id: true,
          slug: true,
          workflowStatus: true,
        },
      });

      if (!existing) {
        throw new Error("内容不存在或已被删除。");
      }

      if (
        existing.workflowStatus === "PUBLISHED" ||
        existing.workflowStatus === "PENDING_REVIEW"
      ) {
        throw new Error("已发布或待审核的内容不能直接删除，请先下线或转回草稿。");
      }

      await tx.content.delete({
        where: { id: existing.id },
      });

      return {
        id: existing.id,
        slug: existing.slug,
      };
    }

    if (kind === "term") {
      const existing = await tx.term.findUnique({
        where: { id: resourceId },
        select: {
          id: true,
          slug: true,
          workflowStatus: true,
        },
      });

      if (!existing) {
        throw new Error("词条不存在或已被删除。");
      }

      if (
        existing.workflowStatus === "PUBLISHED" ||
        existing.workflowStatus === "PENDING_REVIEW"
      ) {
        throw new Error("已发布或待审核的词条不能直接删除，请先下线或转回草稿。");
      }

      await tx.term.delete({
        where: { id: existing.id },
      });

      return {
        id: existing.id,
        slug: existing.slug,
      };
    }

    const existing = await tx.brand.findUnique({
      where: { id: resourceId },
      select: {
        id: true,
        slug: true,
        workflowStatus: true,
      },
    });

    if (!existing) {
      throw new Error("品牌不存在或已被删除。");
    }

    if (
      existing.workflowStatus === "PUBLISHED" ||
      existing.workflowStatus === "PENDING_REVIEW"
    ) {
      throw new Error("已发布或待审核的品牌不能直接删除，请先下线或转回草稿。");
    }

    await tx.brand.delete({
      where: { id: existing.id },
    });

    return {
      id: existing.id,
      slug: existing.slug,
    };
  });
}

export async function changeResourceWorkflowStatusAction(
  kind: ResourceKind,
  resourceId: string,
  intent: StatusMutationIntent,
  nextPath: string,
) {
  await requireAdminSession(nextPath);

  try {
    ensureDatabaseReady();
    const savedItem = await updateResourceWorkflowStatus(kind, resourceId, intent);
    revalidateResourcePaths(kind, savedItem.id, savedItem.slug);
    redirect(
      buildStatusActionRedirect(nextPath, {
        notice: getResourceActionLabel(kind, intent),
      }),
    );
  } catch (error) {
    redirect(
      buildStatusActionRedirect(nextPath, {
        error: `${resourceLabels[kind].singular}操作未完成：${getErrorMessage(error)}`,
      }),
    );
  }
}

export async function changeBulkResourceWorkflowStatusAction(
  kind: ResourceKind,
  nextPath: string,
  formData: FormData,
) {
  await requireAdminSession(nextPath);

  try {
    ensureDatabaseReady();

    const intent = ensureStatusMutationIntent(formData.get("intent"));
    const resourceIds = [...new Set(getSelectedIds(formData, "resourceIds"))];

    if (!intent) {
      throw new Error("当前批量动作无效，请重新选择后再试。");
    }

    if (resourceIds.length === 0) {
      throw new Error("请先勾选至少一条内容后再执行批量操作。");
    }

    const updatedItems: Array<{ id: string; slug: string | null }> = [];
    const failedMessages: string[] = [];

    for (const resourceId of resourceIds) {
      try {
        updatedItems.push(
          await updateResourceWorkflowStatus(kind, resourceId, intent),
        );
      } catch (error) {
        failedMessages.push(getErrorMessage(error));
      }
    }

    updatedItems.forEach((item) => {
      revalidateResourcePaths(kind, item.id, item.slug);
    });

    const successCount = updatedItems.length;
    const failedCount = failedMessages.length;

    if (successCount === 0) {
      throw new Error(
        failedMessages[0] ?? "本次批量操作未成功处理任何内容，请稍后重试。",
      );
    }

    redirect(
      buildStatusActionRedirect(nextPath, {
        notice: `${intentLabels[intent]}已完成：成功 ${successCount} 项${
          failedCount > 0 ? `，失败 ${failedCount} 项` : ""
        }。`,
        error:
          failedCount > 0
            ? `未处理成功的项目：${failedMessages.slice(0, 2).join("；")}${
                failedCount > 2 ? "；请进入对应列表复查剩余项目。" : ""
              }`
            : undefined,
      }),
    );
  } catch (error) {
    redirect(
      buildStatusActionRedirect(nextPath, {
        error: `批量操作未完成：${getErrorMessage(error)}`,
      }),
    );
  }
}

export async function changeResourceWorkflowStatusActionSafe(
  kind: ResourceKind,
  resourceId: string,
  intent: StatusMutationIntent,
  nextPath: string,
) {
  await requireAdminSession(nextPath);

  try {
    ensureDatabaseReady();
    const savedItem = await updateResourceWorkflowStatus(kind, resourceId, intent);
    revalidateResourcePaths(kind, savedItem.id, savedItem.slug);
    redirect(
      buildStatusActionRedirect(nextPath, {
        notice: getResourceActionLabel(kind, intent),
      }),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildStatusActionRedirect(nextPath, {
        error: `${resourceLabels[kind].singular}状态更新未完成：${getErrorMessage(error)}`,
      }),
    );
  }
}

export async function changeBulkResourceWorkflowStatusActionSafe(
  kind: ResourceKind,
  nextPath: string,
  formData: FormData,
) {
  await requireAdminSession(nextPath);

  try {
    ensureDatabaseReady();

    const intent = ensureStatusMutationIntent(formData.get("intent"));
    const resourceIds = [...new Set(getSelectedIds(formData, "resourceIds"))];

    if (!intent) {
      throw new Error("当前批量操作无效，请重新选择后再试。");
    }

    if (resourceIds.length === 0) {
      throw new Error("请先勾选至少一条记录后再执行批量操作。");
    }

    const updatedItems: Array<{ id: string; slug: string | null }> = [];
    const failedMessages: string[] = [];

    for (const resourceId of resourceIds) {
      try {
        updatedItems.push(
          await updateResourceWorkflowStatus(kind, resourceId, intent),
        );
      } catch (error) {
        failedMessages.push(getErrorMessage(error));
      }
    }

    updatedItems.forEach((item) => {
      revalidateResourcePaths(kind, item.id, item.slug);
    });

    const successCount = updatedItems.length;
    const failedCount = failedMessages.length;

    if (successCount === 0) {
      throw new Error(
        failedMessages[0] ?? "本次批量操作未成功处理任何记录，请稍后重试。",
      );
    }

    redirect(
      buildStatusActionRedirect(nextPath, {
        notice: `${intentLabels[intent]}已完成：成功 ${successCount} 项${
          failedCount > 0 ? `，失败 ${failedCount} 项` : ""
        }。`,
        error:
          failedCount > 0
            ? `未处理成功的项目：${failedMessages.slice(0, 2).join("；")}${
                failedCount > 2 ? "；请进入对应列表复查剩余项目。" : ""
              }`
            : undefined,
      }),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildStatusActionRedirect(nextPath, {
        error: `批量操作未完成：${getErrorMessage(error)}`,
      }),
    );
  }
}

export async function deleteResourceAction(
  kind: ResourceKind,
  resourceId: string,
  nextPath: string,
) {
  await requireAdminSession(nextPath);

  try {
    ensureDatabaseReady();
    const deletedItem = await deleteResource(kind, resourceId);
    revalidateResourcePaths(kind, deletedItem.id, deletedItem.slug);
    redirect(
      buildStatusActionRedirect(nextPath, {
        notice: `${resourceLabels[kind].singular}已删除，相关草稿与流程记录已一并清理。`,
      }),
    );
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    redirect(
      buildStatusActionRedirect(nextPath, {
        error: `${resourceLabels[kind].singular}删除未完成：${getErrorMessage(error)}`,
      }),
    );
  }
}
