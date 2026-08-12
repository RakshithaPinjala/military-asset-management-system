import { Router } from 'express';
import { createExpenditure, getExpenditures } from '../controllers/expenditureController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.post(
  '/', 
  authorizeRoles(Role.ADMIN, Role.LOGISTICS_OFFICER, Role.BASE_COMMANDER), 
  enforceBaseScope, 
  createExpenditure
);

router.get(
  '/', 
  authorizeRoles(Role.ADMIN, Role.LOGISTICS_OFFICER, Role.BASE_COMMANDER), 
  enforceBaseScope, 
  getExpenditures
);

export default router;
