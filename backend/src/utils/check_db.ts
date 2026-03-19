import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('--- Database Check ---');
  try {
    const users = await prisma.user.findMany();
    console.log(`Total Users: ${users.length}`);
    users.forEach(u => console.log(`- User: ${u.email} (ID: ${u.id})`));

    const instances = await prisma.instance.findMany({ include: { user: true } });
    console.log(`Total Instances: ${instances.length}`);
    instances.forEach(i => {
      console.log(`- Instance ID: ${i.id}`);
      console.log(`  VMID: ${i.vmid}`);
      console.log(`  User: ${i.user?.email} (ID: ${i.userId})`);
    });
  } catch (error) {
    console.error('Error checking DB:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
