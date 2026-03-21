import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: Role.USER,
    },
  });

  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Laptop Pro 15',
        description: 'Laptop de alto rendimiento con 16GB RAM',
        price: 1299.99,
        stock: 25,
        authorId: admin.id,
      },
      {
        title: 'Mouse Inalámbrico',
        description: 'Mouse ergonómico bluetooth',
        price: 29.99,
        stock: 100,
        authorId: user.id,
      },
      {
        title: 'Teclado Mecánico RGB',
        description: 'Teclado mecánico con switches Cherry MX',
        price: 89.99,
        stock: 50,
        authorId: admin.id,
      },
    ],
  });

  console.log('Seed completed:', { admin: admin.email, user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
