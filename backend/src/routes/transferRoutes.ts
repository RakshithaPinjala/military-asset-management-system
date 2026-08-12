import { Router } from 'express';
import { createTransfer, getTransfers } from '../controllers/transferController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.post(
  '/', 
  authorizeRoles(Role.ADMIN, Role.LOGISTICS_OFFICER), 
  enforceBaseScope, 
  createTransfer
);

router.get(
  '/', 
  authorizeRoles(Role.ADMIN, Role.LOGISTICS_OFFICER, Role.BASE_COMMANDER), 
  enforceBaseScope, 
  getTransfers
);

export default router;
