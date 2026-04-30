import { Request } from 'express';

export interface JwtPayload {
  userId: string;
  brandId: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      brandId?: string;
    }
  }
}
