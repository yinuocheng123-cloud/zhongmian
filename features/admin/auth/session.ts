/**
 * 文件说明：该文件实现中眠网后台最小鉴权所需的服务端 session 能力。
 * 功能说明：负责后台账号配置读取、签名 cookie 生成与校验、登录态读取、后台访问拦截与登出清理。
 *
 * 结构概览：
 *   第一部分：常量、类型与基础配置
 *   第二部分：签名与会话编码辅助
 *   第三部分：登录态读取与校验
 *   第四部分：后台访问守卫与对外接口
 */

import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE_NAME = "zhongmian_admin_session";

const SESSION_DURATION_SECONDS = 60 * 60 * 12;
const DEV_DEFAULT_USERNAME = "admin";
const DEV_DEFAULT_PASSWORD = "zhongmian123456";
const DEV_DEFAULT_SECRET = "zhongmian-dev-session-secret";

type AdminSessionPayload = {
  username: string;
  expiresAt: number;
};

type AdminAuthConfig = {
  username: string;
  password: string;
  secret: string;
  isConfigured: boolean;
  usesDevelopmentFallback: boolean;
};

export type AdminSession = {
  username: string;
  expiresAt: number;
};

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signSessionPayload(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");
}

export function getAdminAuthConfig(): AdminAuthConfig {
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();

  if (username && password && secret) {
    return {
      username,
      password,
      secret,
      isConfigured: true,
      usesDevelopmentFallback: false,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      username: DEV_DEFAULT_USERNAME,
      password: DEV_DEFAULT_PASSWORD,
      secret: DEV_DEFAULT_SECRET,
      isConfigured: true,
      usesDevelopmentFallback: true,
    };
  }

  return {
    username: "",
    password: "",
    secret: "",
    isConfigured: false,
    usesDevelopmentFallback: false,
  };
}

export function sanitizeAdminNextPath(nextPath?: string | null) {
  if (!nextPath) {
    return "/admin";
  }

  const trimmedPath = nextPath.trim();

  if (!trimmedPath.startsWith("/admin")) {
    return "/admin";
  }

  if (trimmedPath.startsWith("/admin/login")) {
    return "/admin";
  }

  return trimmedPath;
}

function buildSessionToken(payload: AdminSessionPayload, secret: string) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = signSessionPayload(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

function parseSessionToken(token: string, secret: string): AdminSession | null {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signSessionPayload(encodedPayload, secret);
  const signatureBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expectedSignature, "utf8");

  if (signatureBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      decodeBase64Url(encodedPayload),
    ) as AdminSessionPayload;

    if (!payload.username || typeof payload.expiresAt !== "number") {
      return null;
    }

    if (payload.expiresAt <= Date.now()) {
      return null;
    }

    return {
      username: payload.username,
      expiresAt: payload.expiresAt,
    };
  } catch {
    return null;
  }
}

function getSessionCookieOptions(expiresAt: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  };
}

export const getOptionalAdminSession = cache(async () => {
  const config = getAdminAuthConfig();

  if (!config.isConfigured) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return parseSessionToken(token, config.secret);
});

export async function requireAdminSession(nextPath?: string) {
  const session = await getOptionalAdminSession();

  if (!session) {
    const targetPath = sanitizeAdminNextPath(nextPath);
    redirect(`/admin/login?next=${encodeURIComponent(targetPath)}`);
  }

  return session;
}

export async function createAdminSession(username: string) {
  const config = getAdminAuthConfig();

  if (!config.isConfigured) {
    throw new Error("后台鉴权配置缺失，请先配置 ADMIN_USERNAME、ADMIN_PASSWORD、ADMIN_SESSION_SECRET。");
  }

  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const token = buildSessionToken(
    {
      username,
      expiresAt,
    },
    config.secret,
  );

  const cookieStore = await cookies();
  cookieStore.set(
    ADMIN_SESSION_COOKIE_NAME,
    token,
    getSessionCookieOptions(expiresAt),
  );
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
}

export function getAdminLoginHint() {
  const config = getAdminAuthConfig();

  if (!config.isConfigured) {
    return {
      title: "后台鉴权未配置",
      description:
        "当前环境未配置 ADMIN_USERNAME、ADMIN_PASSWORD、ADMIN_SESSION_SECRET，生产环境无法完成后台登录。",
    };
  }

  if (config.usesDevelopmentFallback) {
    return {
      title: "当前使用开发环境默认账号",
      description:
        "未检测到后台鉴权环境变量，当前仅在非生产环境下回退到默认账号。正式上线前请务必配置专用后台账号与 session secret。",
    };
  }

  return {
    title: "后台鉴权已启用",
    description: "当前后台登录使用环境变量中的账号与密码，登录成功后会写入服务端签名 cookie。",
  };
}

export function getAdminCredentialPreview() {
  const config = getAdminAuthConfig();

  if (!config.isConfigured || !config.usesDevelopmentFallback) {
    return null;
  }

  return {
    username: config.username,
    password: config.password,
  };
}

export function verifyAdminCredentials(username: string, password: string) {
  const config = getAdminAuthConfig();

  if (!config.isConfigured) {
    return {
      ok: false,
      message:
        "后台鉴权配置缺失，请先配置 ADMIN_USERNAME、ADMIN_PASSWORD、ADMIN_SESSION_SECRET。",
    } as const;
  }

  if (username !== config.username || password !== config.password) {
    return {
      ok: false,
      message: "账号或密码不正确。",
    } as const;
  }

  return { ok: true, username: config.username } as const;
}

export function getAdminActorName() {
  return "admin-user";
}
