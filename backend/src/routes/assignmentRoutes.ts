import { Router } from 'express';
import { createAssignment, returnAssignment, getAssignments } from '../controllers/assignmentController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticateToken);

router.post(
  '/', 
  authorizeRoles(Role.ADMIN, Role.LOGISTICS_OFFICER, Role.BASE_COMMANDER), 
  enforceBaseScope, 
  createAssignment
);

router.post(
  '/:id/return', 
  authorizeRoles(Role.ADMIN, Role.LOGISTICS_OFFICER, Role.BASE_COMMANDER), 
  enforceBaseScope, 
  returnAssignment
);

router.get(
  '/', 
  authorizeRoles(Role.ADMIN, Role.LOGISTICS_OFFICER, Role.BASE_COMMANDER), 
  enforceBaseScope, 
  getAssignments
);

export default router;
