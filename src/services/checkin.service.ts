import prisma from '../config/database';
import redis from '../config/redis';
import { broadcastCheckin } from '../websocket/checkin.gateway';

export class CheckinService {
  static async createCheckin(brandId: string, memberId: string, mockExpired: boolean = false) {
    // 0. Anti-passback logic (Redis-based presence check)
    const presenceKey = `presence:${brandId}:${memberId}`;
    const isInside = await redis.get(presenceKey);
    
    // For the demo, we allow "mockExpired" to skip this or we can show the error
    if (isInside && !mockExpired) {
      throw new Error('Socio già all\'interno della struttura (Anti-passback)');
    }

    // Rate limit lock (skip for mock simulation to allow fast demos)
    if (!mockExpired) {
      const lockKey = `checkin:lock:${memberId}`;
      const isLocked = await redis.get(lockKey);
      if (isLocked) {
        throw new Error('Too many checkins in a short time. Please wait.');
      }
      await redis.setex(lockKey, 30, '1');
    }

    // 1. Verify that member belongs to this brand
    const member = await prisma.member.findFirst({
      where: { id: memberId, brandId },
    });
    if (!member) {
      throw new Error('Member not found or unauthorized');
    }

    // 2. Verify active subscription (check Redis first)
    const subCacheKey = `sub:${brandId}:${memberId}`;
    let subscriptionValid = false;
    let subscriptionType = 'UNKNOWN';

    const cachedSub = await redis.get(subCacheKey);
    if (cachedSub) {
      const parsed = JSON.parse(cachedSub);
      // Check if end date is still in future
      if (new Date(parsed.endDate) > new Date()) {
        subscriptionValid = true;
        subscriptionType = parsed.type;
      }
    } else {
      // Query DB
      const activeSub = await prisma.subscription.findFirst({
        where: {
          memberId,
          brandId,
          status: 'ACTIVE',
          endDate: { gt: new Date() },
        },
      });

      if (activeSub) {
        subscriptionValid = true;
        subscriptionType = activeSub.type;
        // Save to Redis (TTL 10 mins)
        await redis.setex(
          subCacheKey,
          600,
          JSON.stringify({
            subscriptionId: activeSub.id,
            endDate: activeSub.endDate,
            type: activeSub.type,
          })
        );
      }
    }
    
    // Override for demo simulation
    if (mockExpired) {
      subscriptionValid = false;
      subscriptionType = 'EXPIRED_FOR_DEMO';
    }

    // Always create a checkin record, even if sub is invalid (for logging)
    const checkin = await prisma.checkin.create({
      data: {
        memberId,
        brandId,
      },
    });

    if (subscriptionValid) {
      const presenceKey = `presence:${brandId}:${memberId}`;
      await redis.set(presenceKey, '1');
    }

    const currentPresence = await this.getPresenceCount(brandId);

    // 4. Broadcast via WebSocket
    const brand = await prisma.brand.findUnique({ where: { id: brandId } });

    broadcastCheckin(brandId, {
      memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      brandName: brand?.name || 'Unknown',
      checkedAt: checkin.checkedAt.toISOString(),
      subscriptionValid,
      subscriptionType,
      presenceCount: currentPresence,
    });

    return {
      checkin,
      member: {
        firstName: member.firstName,
        lastName: member.lastName,
      },
      subscriptionValid,
      presenceCount: currentPresence,
    };
  }

  static async checkout(brandId: string, memberId: string) {
    const presenceKey = `presence:${brandId}:${memberId}`;
    const isInside = await redis.get(presenceKey);
    if (!isInside) {
      throw new Error('Socio non presente nella struttura');
    }

    const member = await prisma.member.findFirst({
      where: { id: memberId, brandId },
    });
    if (!member) throw new Error('Member not found');

    await redis.del(presenceKey);
    const currentPresence = await this.getPresenceCount(brandId);

    broadcastCheckin(brandId, {
      memberId,
      memberName: `${member.firstName} ${member.lastName}`,
      presenceCount: currentPresence,
      isCheckout: true
    });

    return { success: true, presenceCount: currentPresence };
  }

  static async getPresenceCount(brandId: string) {
    const keys = await redis.keys(`presence:${brandId}:*`);
    return keys.length;
  }

  static async getDetailedPresenceList(brandId: string) {
    const keys = await redis.keys(`presence:${brandId}:*`);
    if (keys.length === 0) return [];

    const memberIds = keys.map(k => k.split(':').pop()!);
    const members = await prisma.member.findMany({
      where: {
        id: { in: memberIds },
        brandId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    return members;
  }

  static async getCheckins(brandId: string, dateStr?: string) {
    let dateFilter = {};
    if (dateStr) {
      const startOfDay = new Date(dateStr);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(dateStr);
      endOfDay.setUTCHours(23, 59, 59, 999);
      
      dateFilter = {
        checkedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };
    }

    return prisma.checkin.findMany({
      where: {
        brandId,
        ...dateFilter,
      },
      orderBy: { checkedAt: 'desc' },
      include: {
        member: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
    });
  }
}
