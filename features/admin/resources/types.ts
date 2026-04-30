/**
 * 文件说明：该文件定义后台资源管理模块的共享类型。
 * 功能说明：统一资源列表、资源表单、分类标签选项、编辑页数据与后台仪表盘所需的数据结构。
 *
 * 结构概览：
 *   第一部分：列表与表单通用类型
 *   第二部分：Content / Term / Brand 编辑数据类型
 *   第三部分：后台仪表盘数据类型
 */

import type {
  AiTaskStatus,
  AiTaskType,
  CategoryScope,
  ContentType,
  SiteChannelKey,
  WorkflowStatus,
} from "@prisma/client";

export type ResourceFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export const initialResourceFormState: ResourceFormState = {
  status: "idle",
};

export type ResourceListQuery = {
  q?: string;
  status?: WorkflowStatus | "";
  contentType?: ContentType | "";
  channelKey?: SiteChannelKey | "";
};

export type TaxonomyOption = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  scope?: CategoryScope;
};

export type ResourceTaxonomyOptions = {
  categoryOptions: TaxonomyOption[];
  tagOptions: TaxonomyOption[];
};

export type ContentFormValues = {
  id?: string;
  title: string;
  slug: string;
  contentType: ContentType;
  channelKey: SiteChannelKey;
  summary: string;
  body: string;
  publishedAt: string;
  eventStartAt: string;
  eventLocation: string;
  eventKind: string;
  referenceVersion: string;
  categoryIds: string[];
  tagIds: string[];
  relatedBrandIds: string[];
  workflowStatus?: WorkflowStatus;
  returnBasePath?: string;
};

export type TermFormValues = {
  id?: string;
  name: string;
  slug: string;
  aliases: string;
  shortDefinition: string;
  definition: string;
  body: string;
  publishedAt: string;
  categoryIds: string[];
  tagIds: string[];
  workflowStatus?: WorkflowStatus;
};

export type BrandFormValues = {
  id?: string;
  name: string;
  slug: string;
  tagline: string;
  summary: string;
  description: string;
  website: string;
  region: string;
  city: string;
  publishedAt: string;
  categoryIds: string[];
  tagIds: string[];
  workflowStatus?: WorkflowStatus;
};

export const emptyContentFormValues: ContentFormValues = {
  title: "",
  slug: "",
  contentType: "KNOWLEDGE",
  channelKey: "KNOWLEDGE",
  summary: "",
  body: "",
  publishedAt: "",
  eventStartAt: "",
  eventLocation: "",
  eventKind: "",
  referenceVersion: "",
  categoryIds: [],
  tagIds: [],
  relatedBrandIds: [],
  workflowStatus: "DRAFT",
};

export const emptyTermFormValues: TermFormValues = {
  name: "",
  slug: "",
  aliases: "",
  shortDefinition: "",
  definition: "",
  body: "",
  publishedAt: "",
  categoryIds: [],
  tagIds: [],
  workflowStatus: "DRAFT",
};

export const emptyBrandFormValues: BrandFormValues = {
  name: "",
  slug: "",
  tagline: "",
  summary: "",
  description: "",
  website: "",
  region: "",
  city: "",
  publishedAt: "",
  categoryIds: [],
  tagIds: [],
  workflowStatus: "DRAFT",
};

export type WorkflowHistoryItem = {
  id: string;
  fromStatus: WorkflowStatus | null;
  toStatus: WorkflowStatus;
  note: string | null;
  actorName: string | null;
  createdAt: Date;
};

export type ContentVersionItem = {
  id: string;
  versionNumber: number;
  titleSnapshot: string;
  changeNote: string | null;
  createdBy: string | null;
  createdAt: Date;
};

export type AiTaskSummaryItem = {
  id: string;
  taskType: AiTaskType;
  status: AiTaskStatus;
  modelName: string | null;
  createdAt: Date;
  finishedAt: Date | null;
};

export type ContentListItem = {
  id: string;
  title: string;
  slug: string;
  contentType: ContentType;
  channelKey: SiteChannelKey;
  workflowStatus: WorkflowStatus;
  updatedAt: Date;
  publishedAt: Date | null;
  categoryNames: string[];
  tagNames: string[];
  publicPath: string | null;
  isSuspicious: boolean;
};

export type TermListItem = {
  id: string;
  name: string;
  slug: string;
  shortDefinition: string | null;
  workflowStatus: WorkflowStatus;
  updatedAt: Date;
  publishedAt: Date | null;
  categoryNames: string[];
  tagNames: string[];
  publicPath: string | null;
  isSuspicious: boolean;
};

export type BrandListItem = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  city: string | null;
  region: string | null;
  workflowStatus: WorkflowStatus;
  updatedAt: Date;
  publishedAt: Date | null;
  categoryNames: string[];
  tagNames: string[];
  publicPath: string | null;
  isSuspicious: boolean;
};

export type ContentEditorData = {
  formValues: ContentFormValues;
  workflowHistory: WorkflowHistoryItem[];
  versions: ContentVersionItem[];
  aiTasks: AiTaskSummaryItem[];
  categoryOptions: TaxonomyOption[];
  tagOptions: TaxonomyOption[];
  brandOptions: TaxonomyOption[];
  publicPath: string | null;
};

export type TermEditorData = {
  formValues: TermFormValues;
  workflowHistory: WorkflowHistoryItem[];
  categoryOptions: TaxonomyOption[];
  tagOptions: TaxonomyOption[];
  publicPath: string | null;
};

export type BrandEditorData = {
  formValues: BrandFormValues;
  workflowHistory: WorkflowHistoryItem[];
  categoryOptions: TaxonomyOption[];
  tagOptions: TaxonomyOption[];
  publicPath: string | null;
};

export type DashboardStatusCount = {
  status: WorkflowStatus;
  label: string;
  count: number;
};

export type DashboardOverviewCard = {
  label: string;
  value: number;
  detail: string;
};

export type DashboardRecentContentItem = {
  id: string;
  title: string;
  contentType: ContentType;
  workflowStatus: WorkflowStatus;
  updatedAt: Date;
};

export type DashboardRecentTaskItem = {
  id: string;
  title: string;
  status: AiTaskStatus;
  taskType: AiTaskType;
  providerId: string | null;
  updatedAt: Date;
  contentId: string | null;
};

export type DashboardLaunchOverview = {
  publishedContentCount: number;
  publishedTermCount: number;
  publishedBrandCount: number;
  pendingReviewCount: number;
  suspiciousPublishedCount: number;
};

export type AdminDashboardData = {
  overviewCards: DashboardOverviewCard[];
  contentStatusCounts: DashboardStatusCount[];
  termStatusCounts: DashboardStatusCount[];
  brandStatusCounts: DashboardStatusCount[];
  recentContents: DashboardRecentContentItem[];
  recentAiTasks: DashboardRecentTaskItem[];
  launchOverview: DashboardLaunchOverview;
};
