import type { Request, Response, NextFunction } from "express";
import { CrmRecordsService } from "./crm-records.service";
import { NotFoundError } from "../../lib/errors";
import type { GetCrmRecordsQuery } from "./crm-records.schema";

const crmRecordsService = new CrmRecordsService();

/**
 * GET /api/v1/crm-records/:jobId
 *
 * Returns paginated, extracted CRM records for a completed import job.
 */
export async function getCrmRecords(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { jobId } = req.params as { jobId: string };
    const { page, limit } = req.query as unknown as GetCrmRecordsQuery;

    const result = await crmRecordsService.getRecordsByJobId(jobId, page, limit);

    if (!result) {
      return next(new NotFoundError(`No records found for job "${jobId}".`));
    }

    res.status(200).json({ success: true, data: result, requestId: req.id });
  } catch (error) {
    next(error);
  }
}
