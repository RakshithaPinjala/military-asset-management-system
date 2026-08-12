import { Request, Response } from 'express';
import { z } from 'zod';
import { createTransferTransaction } from '../services/transferService';
import prisma from '../config/db';

const transferSchema = z.object({
  baseId: z.string().uuid(), // This acts as the sourceBaseId due to enforceBaseScope
  destinationBaseId: z.string().uuid(),
  equipmentTypeId: z.string().uuid(),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
});

export const createTransfer = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = transferSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
      return;
    }

    const { baseId: sourceBaseId, destinationBaseId, equipmentTypeId, quantity, notes } = parsed.data;

    const equipmentType = await prisma.equipmentType.findUnique({
      where: { id: equipmentTypeId },
    });
    
    if (!equipmentType) {
      res.status(404).json({ error: 'Equipment type not found' });
      return;
    }

    const destBase = await prisma.base.findUnique({
      where: { id: destinationBaseId },
    });

    if (!destBase) {
      res.status(404).json({ error: 'Destination base not found' });
      return;
    }

    const transfer = await createTransferTransaction(req.user!.userId, {
      sourceBaseId,
      destinationBaseId,
      equipmentTypeId,
      quantity,
      notes,
    });

    res.status(201).json(transfer);
  } catch (error: any) {
    console.error('Transfer error:', error);
    if (error.message.includes('Insufficient stock') || error.message.includes('cannot be the same')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTransfers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { baseId } = req.query;

    const transfers = await prisma.transfer.findMany({
      where: baseId ? {
        OR: [
          { sourceBaseId: baseId as string },
          { destinationBaseId: baseId as string },
        ]
      } : undefined,
      include: {
        equipmentType: true,
        sourceBase: true,
        destinationBase: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(transfers);
  } catch (error) {
    console.error('Fetch transfers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
