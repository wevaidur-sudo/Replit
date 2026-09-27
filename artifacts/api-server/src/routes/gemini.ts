import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import {
  GenerateGeminiAssistBody,
  GenerateGeminiAssistResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type GeminiPart = { text: string };
type GeminiContent = { role: "user" | "model"; parts: GeminiPart[] };

router.post("/gemini/assist", async (req, res) => {
  const parsed = GenerateGeminiAssistBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid assistant request", details: parsed.error.flatten() });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(503).json({ error: "Gemini is not configured" });
    return;
  }

  const requestId = randomUUID();
  const body = parsed.data;
  const context = [
    body.activeFile ? `Active file: ${body.activeFile}` : "",
    body.activeFileContent ? `Active file contents:\n${body.activeFileContent}` : "",
    body.workspaceTree ? `Workspace tree:\n${body.workspaceTree}` : "",
    body.terminalOutput ? `Recent terminal output:\n${body.terminalOutput}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const history: GeminiContent[] = (body.messages ?? []).map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));
  history.push({
    role: "user",
    parts: [
      {
        text: [
          "You are Orbit, a concise coding assistant inside a browser IDE.",
          "Give practical guidance grounded in the supplied workspace context.",
          "Do not claim to have run code or changed files.",
          context,
          `User request: ${body.prompt}`,
        ]
          .filter(Boolean)
          .join("\n\n"),
      },
    ],
  });

  try {
    const request = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: history,
        generationConfig: { maxOutputTokens: 8192 },
      }),
    };
    let response: Response | undefined;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
        request,
      );
      const retryable = [429, 500, 502, 503, 504].includes(response.status);
      if (response.ok || !retryable || attempt === 2) break;
      await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
    }

    const payload = (await response!.json()) as {
      candidates?: Array<{ content?: { parts?: GeminiPart[] } }>;
      error?: { message?: string };
    };

    if (!response!.ok) {
      req.log.warn({ requestId, status: response!.status }, "Gemini request failed");
      res.status(502).json({ error: payload.error?.message ?? "Gemini request failed" });
      return;
    }

    const content =
      payload.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join("") ?? "Gemini returned no text for this request.";
    const result = GenerateGeminiAssistResponse.parse({
      content,
      model: "gemini-2.5-flash",
      provider: "gemini",
      requestId,
    });

    req.log.info({ requestId }, "Gemini assistant response generated");
    res.json(result);
  } catch (error) {
    req.log.error({ err: error, requestId }, "Gemini assistant request errored");
    res.status(502).json({ error: "Unable to reach Gemini right now" });
  }
});

export default router;