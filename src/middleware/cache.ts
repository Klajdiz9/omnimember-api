import { Request, Response, NextFunction } from 'express';
import redis from '../config/redis';

export const cacheMiddleware = (keyPrefix: string, ttlSeconds: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // We only cache GET requests simply, or we can use specific keys
    if (req.method !== 'GET') {
      return next();
    }

    const brandId = req.brandId;
    const key = `${keyPrefix}:${brandId}:${req.originalUrl}`;

    try {
      const cachedData = await redis.get(key);
      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Override res.json to capture response and cache it
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        redis.setex(key, ttlSeconds, JSON.stringify(body)).catch(console.error);
        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Redis Cache Error:', error);
      next();
    }
  };
};
