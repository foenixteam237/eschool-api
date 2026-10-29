import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Mock/demo seed disabled. No fake users, schools, students or payments are created.');
}

main()
  .catch((error) => {
    console.error('❌ Failed to run seed cleanup status:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
