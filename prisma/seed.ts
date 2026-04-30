import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Create Brands
  const brandMilano = await prisma.brand.upsert({
    where: { slug: 'apex-fitness-milano' },
    update: {},
    create: {
      name: 'Apex Fitness Milano',
      slug: 'apex-fitness-milano',
    },
  });

  const brandRoma = await prisma.brand.upsert({
    where: { slug: 'zenith-club-roma' },
    update: {},
    create: {
      name: 'Zenith Club Roma',
      slug: 'zenith-club-roma',
    },
  });

  // 2. Create Users
  const passwordHash = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@gt-milano.it' },
    update: {},
    create: {
      email: 'admin@gt-milano.it',
      passwordHash,
      role: 'ADMIN',
      brandId: brandMilano.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'admin@gt-roma.it' },
    update: {},
    create: {
      email: 'admin@gt-roma.it',
      passwordHash,
      role: 'ADMIN',
      brandId: brandRoma.id,
    },
  });

  // 3. Create Members & Subscriptions & Checkins
  const createMembersForBrand = async (brandId: string, prefix: string) => {
    const names = [
      { first: 'Marco', last: 'Rossi' },
      { first: 'Giulia', last: 'Bianchi' },
      { first: 'Alessandro', last: 'Ferrara' },
      { first: 'Elena', last: 'Gallo' },
      { first: 'Roberto', last: 'Esposito' },
      { first: 'Chiara', last: 'Ricci' },
      { first: 'Stefano', last: 'Marino' },
      { first: 'Francesca', last: 'Greco' },
      { first: 'Davide', last: 'Bruno' },
      { first: 'Martina', last: 'Longo' },
      { first: 'Luca', last: 'Barbieri' },
      { first: 'Alice', last: 'Fontana' },
      { first: 'Paolo', last: 'Santoro' },
      { first: 'Sofia', last: 'Moretti' },
      { first: 'Matteo', last: 'Rizzo' }
    ];

    for (let i = 0; i < names.length; i++) {
      const email = `member${i+1}@${prefix}.com`;
      const member = await prisma.member.upsert({
        where: { email_brandId: { email, brandId } },
        update: {
          firstName: names[i].first,
          lastName: names[i].last,
        },
        create: {
          firstName: names[i].first,
          lastName: names[i].last,
          email,
          phone: `+39333000000${i+1}`,
          brandId,
        },
      });

      // Mix subscription types
      const types = ['MONTHLY', 'ANNUAL', 'VIP'];
      const subType = types[i % 3];

      // Subscription
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await prisma.subscription.create({
        data: {
          memberId: member.id,
          brandId,
          type: subType as any,
          status: 'ACTIVE',
          startDate,
          endDate,
        },
      });

      // Checkins
      for (let j = 0; j < 3; j++) {
        const checkedAt = new Date();
        checkedAt.setDate(checkedAt.getDate() - j);
        await prisma.checkin.create({
          data: {
            memberId: member.id,
            brandId,
            checkedAt,
          },
        });
      }
    }
  };

  await createMembersForBrand(brandMilano.id, 'milano');
  await createMembersForBrand(brandRoma.id, 'roma');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
