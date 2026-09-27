import { Router, type IRouter } from "express";
import geminiRouter from "./gemini";
import healthRouter from "./health";
import sandboxRouter from "./sandbox";

const router: IRouter = Router();

router.use(healthRouter);
router.use(geminiRouter);
router.use(sandboxRouter);

export default router;
