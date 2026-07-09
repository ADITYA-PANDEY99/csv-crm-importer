import { Router, type IRouter } from "express";
import { validate } from "../../middleware/validate";
import {
  GetCrmRecordsParamsSchema,
  GetCrmRecordsQuerySchema,
} from "./crm-records.schema";
import { getCrmRecords } from "./crm-records.controller";

const router: IRouter = Router();

/**
 * GET /api/v1/crm-records/:jobId?page=1&limit=100
 */
router.get(
  "/:jobId",
  validate("params", GetCrmRecordsParamsSchema),
  validate("query", GetCrmRecordsQuerySchema),
  getCrmRecords
);

export { router as crmRecordsRouter };
