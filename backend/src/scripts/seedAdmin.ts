import { Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import prisma from '../config/db';

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mams.local' },
    update: {},
    create: {
      email: 'admin@mams.local',
      name: 'Super Admin',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  console.log('Admin user created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
