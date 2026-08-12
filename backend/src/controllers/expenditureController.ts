import { Request, Response } from 'express';
import { z } from 'zod';
import { createExpenditureTransaction } from '../services/expenditureService';
import prisma from '../config/db';

const expenditureSchema = z.object({
  baseId: z.string().uuid(),
  equipmentTypeId: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

export const createExpenditure = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = expenditureSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
      return;
    }

    const { baseId, equipmentTypeId, quantity, reason, notes } = parsed.data;

    const equipmentType = await prisma.equipmentType.findUnique({
      where: { id: equipmentTypeId },
    });
    
    if (!equipmentType) {
      res.status(404).json({ error: 'Equipment type not found' });
      return;
    }

    const expenditure = await createExpenditureTransaction(req.user!.userId, {
      baseId,
      equipmentTypeId,
      quantity,
      reason,
      notes,
    });

    res.status(201).json(expenditure);
  } catch (error: any) {
    console.error('Expenditure error:', error);
    if (error.message.includes('Insufficient stock')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getExpenditures = async (req: Request, res: Response): Promise<void> => {
  try {
    const { baseId } = req.query;

    const expenditures = await prisma.expenditure.findMany({
      where: baseId ? { baseId: baseId as string } : undefined,
      include: {
        equipmentType: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(expenditures);
  } catch (error) {
    console.error('Fetch expenditures error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
