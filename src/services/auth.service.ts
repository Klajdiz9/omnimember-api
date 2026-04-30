import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import redis from '../config/redis';

export class AuthService {
  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { brand: true },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      brandId: user.brandId,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'supersecret_change_in_production', { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'change_this_refresh_minimum_32_chars', { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any });

    // Store refresh token in redis session
    await redis.setex(`session:${user.id}`, 7 * 24 * 60 * 60, JSON.stringify({ refreshToken, brandId: user.brandId }));

    return {
      accessToken,
      refreshToken,
      brand: {
        id: user.brand.id,
        name: user.brand.name,
      },
    };
  }

  static async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'change_this_refresh_minimum_32_chars') as any;
      const sessionData = await redis.get(`session:${decoded.userId}`);

      if (!sessionData) {
        throw new Error('Invalid session');
      }

      const session = JSON.parse(sessionData);
      if (session.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      const payload = {
        userId: decoded.userId,
        brandId: decoded.brandId,
        role: decoded.role,
      };

      const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'supersecret_change_in_production', { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any });
      return { accessToken };
    } catch (e) {
      throw new Error('Invalid token');
    }
  }

  static async switchBrand(userId: string, brandId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });
    
    if (!user || !brand) throw new Error('User or Brand not found');

    const payload = {
      userId: user.id,
      brandId: brand.id,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET || 'supersecret_change_in_production', { expiresIn: '15m' });
    return { accessToken, brand: { id: brand.id, name: brand.name } };
  }
}
