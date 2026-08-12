import prisma from '../config/db';
import { Expenditure } from '@prisma/client';
import { calculateBalance } from './balanceService';

export type CreateExpenditureInput = {
  baseId: string;
  equipmentTypeId: string;
  quantity: number;
  reason: string;
  notes?: string;
};

export const createExpenditureTransaction = async (
  userId: string,
  data: CreateExpenditureInput
): Promise<Expenditure> => {
  return await prisma.$transaction(async (tx) => {
    const currentBalance = await calculateBalance(data.baseId, data.equipmentTypeId, tx);
    
    if (currentBalance < data.quantity) {
      throw new Error(`Insufficient stock for expenditure. Available: ${currentBalance}, Requested: ${data.quantity}`);
    }

    const expenditure = await tx.expenditure.create({
      data: {
        baseId: data.baseId,
        equipmentTypeId: data.equipmentTypeId,
        quantity: data.quantity,
        reason: data.reason,
        notes: data.notes ?? null,
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: 'CREATE_EXPENDITURE',
        entity: 'EXPENDITURE',
        entityId: expenditure.id,
        details: JSON.stringify({
          quantity: data.quantity,
          equipmentTypeId: data.equipmentTypeId,
          baseId: data.baseId,
          reason: data.reason,
        }),
      },
    });

    return expenditure;
  });
};
