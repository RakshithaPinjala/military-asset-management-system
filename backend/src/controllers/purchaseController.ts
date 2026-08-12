import { Request, Response } from 'express';
import { z } from 'zod';
import { createPurchaseTransaction } from '../services/purchaseService';
import prisma from '../config/db';

const purchaseSchema = z.object({
  baseId: z.string().uuid(),
  equipmentTypeId: z.string().uuid(),
  quantity: z.number().int().positive(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

export const createPurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = purchaseSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
      return;
    }

    const { baseId, equipmentTypeId, quantity, supplier, notes } = parsed.data;

    const equipmentType = await prisma.equipmentType.findUnique({
      where: { id: equipmentTypeId },
    });
    
    if (!equipmentType) {
      res.status(404).json({ error: 'Equipment type not found' });
      return;
    }

    const purchase = await createPurchaseTransaction(req.user!.userId, {
      baseId,
      equipmentTypeId,
      quantity,
      supplier,
      notes,
    });

    res.status(201).json(purchase);
  } catch (error) {
    console.error('Purchase error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPurchases = async (req: Request, res: Response): Promise<void> => {
  try {
    const { baseId } = req.query;

    const purchases = await prisma.purchase.findMany({
      where: baseId ? { baseId: baseId as string } : undefined,
      include: {
        equipmentType: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(purchases);
  } catch (error) {
    console.error('Fetch purchases error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
