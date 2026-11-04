import "server-only";
import { z } from "zod";
import { unzipSync, strFromU8 } from "fflate";
const endpoint = "https://public-api.gamma.app/v1.0/agent/generations";
const warningSchema = z.object({ code: z.string() });
const startSchema = z.object({
  generationId: z.string().regex(/^gen_[A-Za-z0-9]+$/),
  warnings: z.array(warningSchema).default([]),
});
const resultSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("pending") }),
  z.object({
    status: z.literal("completed"),
    exportUrl: z.url().optional(),
    warnings: z.array(warningSchema).default([]),
  }),
  z.object({
    status: z.literal("failed"),
    error: z.object({ reason: z.string() }),
  }),
]);
function headers(): Record<string, string> {
  const key = process.env.REPORT_GENERATION_API_KEY;
  if (!key) throw new Error("REPORTING_NOT_CONFIGURED");
  return { "Content-Type": "application/json", "X-API-KEY": key };
}
export async function startPresentation(
  templateId: string,
  prompt: string,
): Promise<{ id: string; unsafeSharing: boolean }> {
  if (prompt.length > 400000) throw new Error("GENERATION_FAILED");
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        prompt,
        templateId,
        format: "presentation",
        exportAs: "pptx",
        disableConnectors: true,
        sharingOptions: {
          workspaceAccess: "noAccess",
          externalAccess: "noAccess",
        },
      }),
      signal: AbortSignal.timeout(25000),
      cache: "no-store",
    });
  } catch {
    throw new Error("START_UNCERTAIN");
  }
  if (!response.ok) {
    const code = (
      {
        400: "TEMPLATE_INVALID",
        401: "ACCESS_DENIED",
        403: "USAGE_LIMIT",
        429: "RATE_LIMITED",
      } as Record<number, string>
    )[response.status];
    throw new Error(code ?? "START_UNCERTAIN");
  }
  try {
    const result = startSchema.parse(await response.json());
    return {
      id: result.generationId,
      unsafeSharing: result.warnings.some((w) =>
        [
          "ignored_external_access",
          "ignored_workspace_access",
          "external_access_failed",
          "workspace_access_failed",
        ].includes(w.code),
      ),
    };
  } catch {
    throw new Error("START_UNCERTAIN");
  }
}
export async function readPresentation(id: string): Promise<{
  status: "pending" | "failed" | "completed";
  exportUrl?: string;
  errorCode?: "USAGE_LIMIT" | "ACCESS_DENIED" | "GENERATION_FAILED";
}> {
  const response = await fetch(`${endpoint}/${encodeURIComponent(id)}`, {
    headers: headers(),
    signal: AbortSignal.timeout(20000),
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(
      response.status === 401 || response.status === 403
        ? "ACCESS_DENIED"
        : response.status === 404
          ? "GENERATION_FAILED"
          : "PROCESSING_FAILED",
    );
  const result = resultSchema.parse(await response.json());
  if (result.status === "failed")
    return {
      status: "failed",
      errorCode:
        result.error.reason === "insufficient_credits"
          ? "USAGE_LIMIT"
          : result.error.reason === "access_revoked"
            ? "ACCESS_DENIED"
            : "GENERATION_FAILED",
    };
  if (
    result.status === "completed" &&
    result.warnings.some((w) =>
      [
        "ignored_external_access",
        "ignored_workspace_access",
        "external_access_failed",
        "workspace_access_failed",
      ].includes(w.code),
    )
  )
    return { status: "failed", errorCode: "ACCESS_DENIED" };
  return result.status === "completed"
    ? { status: "completed", exportUrl: result.exportUrl }
    : { status: "pending" };
}
function checkedExportUrl(value: string): URL {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !(url.hostname === "gamma.app" || url.hostname.endsWith(".gamma.app"))
  )
    throw new Error("DOWNLOAD_FAILED");
  return url;
}
export async function downloadPresentation(value: string): Promise<Uint8Array> {
  let url = checkedExportUrl(value);
  for (let redirects = 0; redirects < 4; redirects++) {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
      cache: "no-store",
    });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      if (!location) throw new Error("DOWNLOAD_FAILED");
      await response.body?.cancel();
      url = checkedExportUrl(new URL(location, url).href);
      continue;
    }
    if (
      !response.ok ||
      !response.body ||
      Number(response.headers.get("content-length")) > 33554432
    )
      throw new Error("DOWNLOAD_FAILED");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        length += value.length;
        if (length > 33554432) throw new Error("DOWNLOAD_FAILED");
        chunks.push(value);
      }
    } finally {
      await reader.cancel();
    }
    const bytes = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.length;
    }
    try {
      const entries = unzipSync(bytes, {
        filter: (file) => {
          const selected = [
            "[Content_Types].xml",
            "ppt/presentation.xml",
          ].includes(file.name);
          if (selected && file.originalSize > 2097152)
            throw new Error("INVALID_POWERPOINT");
          return selected;
        },
      });
      if (
        !entries["ppt/presentation.xml"] ||
        !entries["[Content_Types].xml"] ||
        !strFromU8(entries["[Content_Types].xml"]).includes(
          "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml",
        )
      )
        throw new Error("INVALID_POWERPOINT");
    } catch {
      throw new Error("INVALID_POWERPOINT");
    }
    return bytes;
  }
  throw new Error("DOWNLOAD_FAILED");
}
