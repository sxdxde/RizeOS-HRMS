const { PrismaClient } = require('@prisma/client');

// Single shared PrismaClient instance for the entire server.
// Using multiple instances would exhaust the DB connection pool.
const prisma = new PrismaClient();

module.exports = prisma;
