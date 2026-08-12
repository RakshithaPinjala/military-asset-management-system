import { Request, Response } from 'express';
import prisma from '../config/db';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { baseId, startDate, endDate } = req.query;

    if (!baseId) {
      res.status(400).json({ error: 'baseId is required' });
      return;
    }

    const start = startDate ? new Date(startDate as string) : new Date(0);
    const end = endDate ? new Date(endDate as string) : new Date();

    const result: any[] = await prisma.$queryRaw`
      WITH eq AS (
        SELECT id as "equipmentTypeId", name as "equipmentName", category FROM "EquipmentType"
      ),
      opening_purchases AS (
        SELECT "equipmentTypeId", SUM(quantity) as val FROM "Purchase" WHERE "baseId" = ${baseId} AND "createdAt" < ${start} GROUP BY "equipmentTypeId"
      ),
      opening_transfers_in AS (
        SELECT "equipmentTypeId", SUM(quantity) as val FROM "Transfer" WHERE "destinationBaseId" = ${baseId} AND "createdAt" < ${start} GROUP BY "equipmentTypeId"
      ),
      opening_transfers_out AS (
        SELECT "equipmentTypeId", SUM(quantity) as val FROM "Transfer" WHERE "sourceBaseId" = ${baseId} AND "createdAt" < ${start} GROUP BY "equipmentTypeId"
      ),
      opening_assignments AS (
        SELECT "equipmentTypeId", SUM(quantity) as val FROM "Assignment" WHERE "baseId" = ${baseId} AND "status" = 'ACTIVE' AND "createdAt" < ${start} GROUP BY "equipmentTypeId"
      ),
      opening_expenditures AS (
        SELECT "equipmentTypeId", SUM(quantity) as val FROM "Expenditure" WHERE "baseId" = ${baseId} AND "createdAt" < ${start} GROUP BY "equipmentTypeId"
      ),
      period_purchases AS (
        SELECT "equipmentTypeId", SUM(quantity) as val FROM "Purchase" WHERE "baseId" = ${baseId} AND "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY "equipmentTypeId"
      ),
      period_transfers_in AS (
        SELECT "equipmentTypeId", SUM(quantity) as val FROM "Transfer" WHERE "destinationBaseId" = ${baseId} AND "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY "equipmentTypeId"
      ),
      period_transfers_out AS (
        SELECT "equipmentTypeId", SUM(quantity) as val FROM "Transfer" WHERE "sourceBaseId" = ${baseId} AND "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY "equipmentTypeId"
      ),
      period_assignments AS (
        SELECT "equipmentTypeId", SUM(quantity) as val FROM "Assignment" WHERE "baseId" = ${baseId} AND "status" = 'ACTIVE' AND "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY "equipmentTypeId"
      ),
      period_expenditures AS (
        SELECT "equipmentTypeId", SUM(quantity) as val FROM "Expenditure" WHERE "baseId" = ${baseId} AND "createdAt" >= ${start} AND "createdAt" <= ${end} GROUP BY "equipmentTypeId"
      )
      SELECT 
        eq."equipmentTypeId",
        eq."equipmentName",
        eq.category,
        COALESCE(op.val, 0) + COALESCE(oti.val, 0) - COALESCE(oto.val, 0) - COALESCE(oa.val, 0) - COALESCE(oe.val, 0) AS "openingBalance",
        COALESCE(pp.val, 0) AS purchases,
        COALESCE(pti.val, 0) AS "transfersIn",
        COALESCE(pto.val, 0) AS "transfersOut",
        (COALESCE(pp.val, 0) + COALESCE(pti.val, 0) - COALESCE(pto.val, 0)) AS "netMovement",
        COALESCE(pa.val, 0) AS assignments,
        COALESCE(pe.val, 0) AS expenditures,
        (
          (COALESCE(op.val, 0) + COALESCE(oti.val, 0) - COALESCE(oto.val, 0) - COALESCE(oa.val, 0) - COALESCE(oe.val, 0)) +
          (COALESCE(pp.val, 0) + COALESCE(pti.val, 0) - COALESCE(pto.val, 0)) -
          COALESCE(pa.val, 0) - COALESCE(pe.val, 0)
        ) AS "closingBalance"
      FROM eq
      LEFT JOIN opening_purchases op ON eq."equipmentTypeId" = op."equipmentTypeId"
      LEFT JOIN opening_transfers_in oti ON eq."equipmentTypeId" = oti."equipmentTypeId"
      LEFT JOIN opening_transfers_out oto ON eq."equipmentTypeId" = oto."equipmentTypeId"
      LEFT JOIN opening_assignments oa ON eq."equipmentTypeId" = oa."equipmentTypeId"
      LEFT JOIN opening_expenditures oe ON eq."equipmentTypeId" = oe."equipmentTypeId"
      LEFT JOIN period_purchases pp ON eq."equipmentTypeId" = pp."equipmentTypeId"
      LEFT JOIN period_transfers_in pti ON eq."equipmentTypeId" = pti."equipmentTypeId"
      LEFT JOIN period_transfers_out pto ON eq."equipmentTypeId" = pto."equipmentTypeId"
      LEFT JOIN period_assignments pa ON eq."equipmentTypeId" = pa."equipmentTypeId"
      LEFT JOIN period_expenditures pe ON eq."equipmentTypeId" = pe."equipmentTypeId";
    `;

    // Convert BigInts from PostgreSQL to Number
    const formattedResult = result.map((row) => {
      const formattedRow: any = {};
      for (const [key, value] of Object.entries(row)) {
        formattedRow[key] = typeof value === 'bigint' ? Number(value) : value;
      }
      return formattedRow;
    });

    res.status(200).json(formattedResult);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
