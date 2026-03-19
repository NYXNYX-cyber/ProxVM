import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clean() {
  console.log('--- Memulai Pembersihan Database ---');
  try {
    const deleted = await prisma.instance.deleteMany({});
    console.log(`Berhasil menghapus ${deleted.count} VPS dari dashboard.`);
  } catch (error) {
    console.error('Gagal menghapus data:', error);
  } finally {
    await prisma.$disconnect();
  }
  console.log('--- Pembersihan Selesai ---');
}

clean();
