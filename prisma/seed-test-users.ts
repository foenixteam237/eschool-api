import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Test/mock user seed disabled. No demo credentials are created.');
}

main()
  .catch((error) => {
    console.error('❌ Failed to run test user seed cleanup status:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
