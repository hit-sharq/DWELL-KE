require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.property.findMany()
  .then(console.log)
  .catch(console.error)
  .finally(() => prisma.$disconnect());
