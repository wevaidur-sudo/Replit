import { randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { RunSandboxBody, RunSandboxResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/sandbox/run", (req, res) => {
  const parsed = RunSandboxBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid sandbox request", details: parsed.error.flatten() });
    return;
  }

  const { command, entrypoint, files, language } = parsed.data;
  const runId = randomUUID();
  const result = RunSandboxResponse.parse({
    id: runId,
    status: "queued",
    stdout: [
      `orbit@sandbox ~/project $ ${command}`,
      `  queued entrypoint: ${entrypoint}`,
      `  files received: ${Object.keys(files).length}`,
    ].join("\n"),
    stderr: "",
    durationMs: 0,
    provider: "cloud-sandbox-adapter",
    note: language
      ? `${language} runtime request accepted. Connect an E2B or Modal adapter to execute arbitrary code in an isolated micro-VM.`
      : "Runtime request accepted. Connect an E2B or Modal adapter to execute arbitrary code in an isolated micro-VM.",
  });

  req.log.info({ runId, command, entrypoint }, "Sandbox run queued");
  res.json(result);
});

export default router;