import prisma from '../config/database';

export class MemberService {
  static async getMembers(brandId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where: { brandId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.member.count({ where: { brandId } }),
    ]);

    return {
      data: members,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getMemberById(id: string, brandId: string) {
    return prisma.member.findFirst({
      where: { id, brandId },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
        },
      },
    });
  }

  static async createMember(brandId: string, data: { firstName: string; lastName: string; email: string; phone?: string }) {
    return prisma.member.create({
      data: {
        ...data,
        brandId,
      },
    });
  }

  static async updateMember(id: string, brandId: string, data: Partial<{ firstName: string; lastName: string; email: string; phone: string }>) {
    // Ensure member belongs to brand before updating
    const member = await prisma.member.findFirst({ where: { id, brandId } });
    if (!member) throw new Error('Member not found');

    return prisma.member.update({
      where: { id },
      data,
    });
  }

  static async deleteMember(id: string, brandId: string) {
    const member = await prisma.member.findFirst({ where: { id, brandId } });
    if (!member) throw new Error('Member not found');

    // Soft delete can be implemented, but for now we'll do physical delete or just let Prisma cascade (if configured)
    return prisma.member.delete({
      where: { id },
    });
  }
}
