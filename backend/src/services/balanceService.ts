import prisma from '../config/db';

export const calculateBalance = async (baseId: string, equipmentTypeId: string, tx: any = prisma): Promise<number> => {
  const result: any = await tx.$queryRaw`
    SELECT 
      COALESCE((SELECT SUM(quantity) FROM "Purchase" WHERE "baseId" = ${baseId} AND "equipmentTypeId" = ${equipmentTypeId}), 0) +
      COALESCE((SELECT SUM(quantity) FROM "Transfer" WHERE "destinationBaseId" = ${baseId} AND "equipmentTypeId" = ${equipmentTypeId}), 0) -
      COALESCE((SELECT SUM(quantity) FROM "Transfer" WHERE "sourceBaseId" = ${baseId} AND "equipmentTypeId" = ${equipmentTypeId}), 0) -
      COALESCE((SELECT SUM(quantity) FROM "Assignment" WHERE "baseId" = ${baseId} AND "equipmentTypeId" = ${equipmentTypeId} AND "status" = 'ACTIVE'), 0) -
      COALESCE((SELECT SUM(quantity) FROM "Expenditure" WHERE "baseId" = ${baseId} AND "equipmentTypeId" = ${equipmentTypeId}), 0) 
    AS balance
  `;
  
  return Number(result[0]?.balance || 0);
};
