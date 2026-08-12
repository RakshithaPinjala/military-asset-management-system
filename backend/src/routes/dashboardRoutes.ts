import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboardController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.get(
  '/stats', 
  authorizeRoles(Role.ADMIN, Role.LOGISTICS_OFFICER, Role.BASE_COMMANDER), 
  enforceBaseScope, 
  getDashboardStats
);

export default router;
