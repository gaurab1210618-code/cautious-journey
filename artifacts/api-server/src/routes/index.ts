import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import analysisRouter from "./analysis.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/analysis", analysisRouter);

export default router;
