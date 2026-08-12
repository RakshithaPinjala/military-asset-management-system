import { Request, Response } from 'express';
import { z } from 'zod';
import { createAssignmentTransaction, returnAssignmentTransaction } from '../services/assignmentService';
import prisma from '../config/db';

const assignmentSchema = z.object({
  baseId: z.string().uuid(),
  equipmentTypeId: z.string().uuid(),
  quantity: z.number().int().positive(),
  assignedTo: z.string().min(1),
  notes: z.string().optional(),
});

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = assignmentSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
      return;
    }

    const { baseId, equipmentTypeId, quantity, assignedTo, notes } = parsed.data;

    const equipmentType = await prisma.equipmentType.findUnique({
      where: { id: equipmentTypeId },
    });
    
    if (!equipmentType) {
      res.status(404).json({ error: 'Equipment type not found' });
      return;
    }

    const assignment = await createAssignmentTransaction(req.user!.userId, {
      baseId,
      equipmentTypeId,
      quantity,
      assignedTo,
      notes,
    });

    res.status(201).json(assignment);
  } catch (error: any) {
    console.error('Assignment error:', error);
    if (error.message.includes('Insufficient stock')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const returnAssignment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // enforceBaseScope adds baseId to body
    const baseId = req.body.baseId as string;

    const assignment = await returnAssignmentTransaction(req.user!.userId, id as string, baseId as string);
    res.status(200).json(assignment);
  } catch (error: any) {
    console.error('Return error:', error);
    if (error.message.includes('not found') || error.message.includes('already returned') || error.message.includes('belong')) {
      res.status(400).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { baseId } = req.query;

    const assignments = await prisma.assignment.findMany({
      where: baseId ? { baseId: baseId as string } : undefined,
      include: {
        equipmentType: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(assignments);
  } catch (error) {
    console.error('Fetch assignments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
