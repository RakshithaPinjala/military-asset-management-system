import { Request, Response, NextFunction } from 'express';

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      return;
    }

    next();
  };
};

export const enforceBaseScope = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (!req.user.baseId) {
    res.status(403).json({ error: 'Forbidden: no base assigned' });
    return;
  }

  const requestBaseId = req.body.baseId || req.query.baseId || req.params.baseId;
  
  if (requestBaseId && requestBaseId !== req.user.baseId) {
    res.status(403).json({ error: 'Forbidden: cross-base access is not allowed' });
    return;
  }

  // Enforce base scope structurally
  if (req.method === 'GET' || req.method === 'DELETE') {
    req.query.baseId = req.user.baseId;
  } else {
    req.body.baseId = req.user.baseId;
  }

  next();
};
