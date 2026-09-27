import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  BuildWorkspaceBody,
  BuildWorkspaceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type GeminiPart = { text: string };

function parseGeneratedJson(content: string): unknown {
  const withoutFence = content
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  const start = withoutFence.indexOf("{");
  const end = withoutFence.lastIndexOf("}");
  if (start === -1 || end <= start) {
    throw new Error("Gemini did not return a JSON build response");
  }
  return JSON.parse(withoutFence.slice(start, end + 1));
}

router.post("/gemini/build", async (req, res) => {
  const parsed = BuildWorkspaceBody.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid build request", details: parsed.error.flatten() });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Gemini is not configured" });
    return;
  }

  const requestId = randomUUID();
  const body = parsed.data;
  const currentFiles = Object.entries(body.currentFiles ?? {})
    .map(([path, content]) => `\n--- ${path} ---\n${content}`)
    .join("");

  const instruction = [
    "You are Orbit, a coding agent inside a browser IDE.",
    "The user wants you to build the requested experience, not just explain it.",
    "Return JSON only. Do not wrap it in markdown fences.",
    "The JSON must have exactly these top-level keys: summary, files, previewHtml.",
    "summary must be a short sentence describing what you built.",
    "files must be an object containing valid source files for the workspace.",
    "Always include /src/App.tsx, /src/styles.css, and /README.md in files.",
    "App.tsx must be self-contained and must not import components that are not also returned in files.",
    "Keep the source code coherent and runnable in a React + Vite workspace.",
    "previewHtml must be a complete standalone HTML document with inline CSS and JavaScript.",
    "The preview must work when opened directly in a new browser tab with no build step, no external network requests, and no external asset URLs.",
    "Make the result feel complete and polished, with meaningful copy and working interactions appropriate to the request.",
    "Do not claim to have run commands or changed files outside the returned files.",
    `User build request:\n${body.prompt}`,
    body.workspaceTree ? `Existing workspace tree:\n${body.workspaceTree}` : "",
    currentFiles ? `Existing file contents to improve or replace:${currentFiles}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: instruction }] }],
          generationConfig: {
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
          },
        }),
      },
    );

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
      error?: { message?: string };
    };

    if (!response.ok) {
      req.log.warn({ requestId, status: response.status }, "Gemini build request failed");
      res
        .status(502)
        .json({ error: payload.error?.message ?? "Gemini build request failed" });
      return;
    }

    const content =
      payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join("") ?? "";
    const generated = parseGeneratedJson(content);
    const result = BuildWorkspaceResponse.parse({
      ...(generated as Record<string, unknown>),
      model: "gemini-2.5-flash",
      provider: "gemini",
      requestId,
    });

    req.log.info({ requestId }, "Workspace build generated");
    res.json(result);
  } catch (error) {
    req.log.error({ err: error, requestId }, "Workspace build errored");
    res.status(502).json({
      error:
        "Gemini could not produce a valid workspace build. Try a shorter or more specific request.",
    });
  }
});

export default router;