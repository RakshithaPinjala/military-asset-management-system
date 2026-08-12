import prisma from '../config/db';
import { Purchase } from '@prisma/client';

export type CreatePurchaseInput = {
  baseId: string;
  equipmentTypeId: string;
  quantity: number;
  supplier?: string;
  notes?: string;
};

export const createPurchaseTransaction = async (
  userId: string,
  data: CreatePurchaseInput
): Promise<Purchase> => {
  return await prisma.$transaction(async (tx) => {
    // 1. Create the purchase record
    const purchase = await tx.purchase.create({
      data: {
        baseId: data.baseId,
        equipmentTypeId: data.equipmentTypeId,
        quantity: data.quantity,
        supplier: data.supplier ?? null,
        notes: data.notes ?? null,
      },
    });

    // 2. Create the audit log in the same transaction
    await tx.auditLog.create({
      data: {
        userId,
        action: 'CREATE_PURCHASE',
        entity: 'PURCHASE',
        entityId: purchase.id,
        details: JSON.stringify({
          quantity: data.quantity,
          equipmentTypeId: data.equipmentTypeId,
          baseId: data.baseId,
        }),
      },
    });

    return purchase;
  });
};
