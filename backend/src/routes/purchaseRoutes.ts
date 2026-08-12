import { Router } from 'express';
import { createPurchase, getPurchases } from '../controllers/purchaseController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.post(
  '/', 
  authorizeRoles(Role.ADMIN, Role.LOGISTICS_OFFICER), 
  enforceBaseScope, 
  createPurchase
);

router.get(
  '/', 
  authorizeRoles(Role.ADMIN, Role.LOGISTICS_OFFICER, Role.BASE_COMMANDER), 
  enforceBaseScope, 
  getPurchases
);

export default router;
