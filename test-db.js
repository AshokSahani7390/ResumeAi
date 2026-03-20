require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma connection...');
    const userCount = await prisma.user.count();
    console.log('Connection successful! User count:', userCount);
    
    // Try to create a dummy user
    const testEmail = `test_${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        name: 'Test Connection',
        email: testEmail,
        passwordHash: 'dummy'
      }
    });
    console.log('Successfully created test user:', user.email);
    
    // Clean up
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Test complete and cleaned up.');
  } catch (err) {
    console.error('Prisma Connection Test FAILED:');
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
