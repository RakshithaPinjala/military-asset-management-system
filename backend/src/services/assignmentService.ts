import prisma from '../config/db';
import { Assignment } from '@prisma/client';
import { calculateBalance } from './balanceService';

export type CreateAssignmentInput = {
  baseId: string;
  equipmentTypeId: string;
  quantity: number;
  assignedTo: string;
  notes?: string;
};

export const createAssignmentTransaction = async (
  userId: string,
  data: CreateAssignmentInput
): Promise<Assignment> => {
  return await prisma.$transaction(async (tx) => {
    const currentBalance = await calculateBalance(data.baseId, data.equipmentTypeId, tx);
    
    if (currentBalance < data.quantity) {
      throw new Error(`Insufficient stock for assignment. Available: ${currentBalance}, Requested: ${data.quantity}`);
    }

    const assignment = await tx.assignment.create({
      data: {
        baseId: data.baseId,
        equipmentTypeId: data.equipmentTypeId,
        quantity: data.quantity,
        assignedTo: data.assignedTo,
        notes: data.notes ?? null,
      },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: 'CREATE_ASSIGNMENT',
        entity: 'ASSIGNMENT',
        entityId: assignment.id,
        details: JSON.stringify({
          quantity: data.quantity,
          equipmentTypeId: data.equipmentTypeId,
          baseId: data.baseId,
          assignedTo: data.assignedTo,
        }),
      },
    });

    return assignment;
  });
};

export const returnAssignmentTransaction = async (
  userId: string,
  assignmentId: string,
  baseId: string
): Promise<Assignment> => {
  return await prisma.$transaction(async (tx) => {
    const assignment = await tx.assignment.findUnique({ where: { id: assignmentId } });
    if (!assignment) throw new Error('Assignment not found');
    if (assignment.baseId !== baseId) throw new Error('Assignment does not belong to this base');
    if (assignment.status === 'RETURNED') throw new Error('Assignment already returned');

    const updated = await tx.assignment.update({
      where: { id: assignmentId },
      data: { status: 'RETURNED' },
    });

    await tx.auditLog.create({
      data: {
        userId,
        action: 'RETURN_ASSIGNMENT',
        entity: 'ASSIGNMENT',
        entityId: assignment.id,
        details: JSON.stringify({
          quantity: assignment.quantity,
          equipmentTypeId: assignment.equipmentTypeId,
          baseId: assignment.baseId,
        }),
      },
    });

    return updated;
  });
};
