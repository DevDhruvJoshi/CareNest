import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  await prisma.user.upsert({
    where: { email },
    update: { name: 'Admin' },
    create: { email, name: 'Admin' },
  });
  await prisma.auditLog.create({
    data: { actorId: email, action: 'seed', resource: 'bootstrap', meta: { env: process.env.NODE_ENV || 'development' } as any },
  }).catch(() => {});
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });




