import prisma from '../config/db';
import { Transfer } from '@prisma/client';
import { calculateBalance } from './balanceService';

export type CreateTransferInput = {
  sourceBaseId: string;
  destinationBaseId: string;
  equipmentTypeId: string;
  quantity: number;
  notes?: string;
};

export const createTransferTransaction = async (
  userId: string,
  data: CreateTransferInput
): Promise<Transfer> => {
  if (data.sourceBaseId === data.destinationBaseId) {
    throw new Error('Source and destination bases cannot be the same');
  }

  return await prisma.$transaction(async (tx) => {
    // Check balance inside the transaction
    const currentBalance = await calculateBalance(data.sourceBaseId, data.equipmentTypeId, tx);
    
    if (currentBalance < data.quantity) {
      throw new Error(`Insufficient stock. Available: ${currentBalance}, Requested: ${data.quantity}`);
    }

    // 1. Create the transfer record
    const transfer = await tx.transfer.create({
      data: {
        sourceBaseId: data.sourceBaseId,
        destinationBaseId: data.destinationBaseId,
        equipmentTypeId: data.equipmentTypeId,
        quantity: data.quantity,
        notes: data.notes ?? null,
      },
    });

    // 2. Create the audit log in the same transaction
    await tx.auditLog.create({
      data: {
        userId,
        action: 'CREATE_TRANSFER',
        entity: 'TRANSFER',
        entityId: transfer.id,
        details: JSON.stringify({
          quantity: data.quantity,
          equipmentTypeId: data.equipmentTypeId,
          sourceBaseId: data.sourceBaseId,
          destinationBaseId: data.destinationBaseId,
        }),
      },
    });

    return transfer;
  });
};
