import { Request, Response, NextFunction } from 'express';

export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.brandId) {
    return res.status(403).json({ error: 'Forbidden: No tenant context provided' });
  }
  next();
};
