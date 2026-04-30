import prisma from '../config/database';
import redis from '../config/redis';
import { SubscriptionType } from '@prisma/client';

export class SubscriptionService {
  static async getSubscriptions(brandId: string) {
    return prisma.subscription.findMany({
      where: { brandId },
      orderBy: { createdAt: 'desc' },
      include: { member: true },
    });
  }

  static async getMemberSubscriptions(memberId: string, brandId: string) {
    return prisma.subscription.findMany({
      where: { memberId, brandId },
      orderBy: { startDate: 'desc' },
    });
  }

  static async createSubscription(brandId: string, data: { memberId: string; type: SubscriptionType; startDate: Date; endDate: Date }) {
    // Ensure member belongs to brand
    const member = await prisma.member.findFirst({ where: { id: data.memberId, brandId } });
    if (!member) throw new Error('Member not found');

    const subscription = await prisma.subscription.create({
      data: {
        ...data,
        brandId,
        status: 'ACTIVE',
      },
    });

    // Invalidate any cache for this member's subscription
    await redis.del(`sub:${brandId}:${data.memberId}`);

    return subscription;
  }

  static async suspendSubscription(id: string, brandId: string) {
    const subscription = await prisma.subscription.findFirst({ where: { id, brandId } });
    if (!subscription) throw new Error('Subscription not found');

    const updated = await prisma.subscription.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    // Invalidate cache
    await redis.del(`sub:${brandId}:${subscription.memberId}`);

    return updated;
  }
}
