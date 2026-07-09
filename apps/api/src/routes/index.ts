import { Router, type IRouter } from "express";
import { healthRouter } from "../features/health/health.router";
import { uploadRouter } from "../features/upload/upload.router";
import { crmRecordsRouter } from "../features/crm-records/crm-records.router";

const router: IRouter = Router();

/**
 * API v1 route aggregator.
 * All feature routers are mounted here, keeping app.ts clean.
 */
router.use("/health", healthRouter);
router.use("/uploads", uploadRouter);
router.use("/crm-records", crmRecordsRouter);

export { router as apiV1Router };
