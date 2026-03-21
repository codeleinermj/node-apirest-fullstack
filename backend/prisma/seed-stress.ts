import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const TOTAL_PRODUCTS = 5000;
const BATCH_SIZE = 500;

const adjectives = [
  'Premium', 'Ultra', 'Pro', 'Elite', 'Smart', 'Turbo', 'Mega', 'Slim',
  'Advanced', 'Compact', 'Wireless', 'Portable', 'Digital', 'Classic', 'Mini',
];
const nouns = [
  'Laptop', 'Monitor', 'Keyboard', 'Mouse', 'Headset', 'Camera', 'Speaker',
  'Tablet', 'Router', 'Charger', 'Cable', 'Drive', 'Microphone', 'Printer',
  'Scanner', 'Dock', 'Hub', 'Adapter', 'Controller', 'Sensor',
];

function randomProduct(authorId: string, index: number) {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return {
    title: `${adj} ${noun} ${index}`,
    description: `High quality ${adj.toLowerCase()} ${noun.toLowerCase()} - unit #${index}`,
    price: parseFloat((Math.random() * 2000 + 5).toFixed(2)),
    stock: Math.floor(Math.random() * 500),
    authorId,
  };
}

async function main() {
  console.log(`Seeding ${TOTAL_PRODUCTS} products for stress test...`);

  // Create test users
  const password = await bcrypt.hash('stress123', 10);

  const stressUser = await prisma.user.upsert({
    where: { email: 'stress@test.com' },
    update: {},
    create: {
      email: 'stress@test.com',
      name: 'Stress Tester',
      password,
      role: Role.USER,
    },
  });

  // Insert products in batches
  let created = 0;
  for (let batch = 0; batch < Math.ceil(TOTAL_PRODUCTS / BATCH_SIZE); batch++) {
    const start = batch * BATCH_SIZE;
    const size = Math.min(BATCH_SIZE, TOTAL_PRODUCTS - start);
    const products = Array.from({ length: size }, (_, i) =>
      randomProduct(stressUser.id, start + i + 1)
    );

    const result = await prisma.product.createMany({
      data: products,
      skipDuplicates: true,
    });
    created += result.count;
    console.log(`  Batch ${batch + 1}: ${created}/${TOTAL_PRODUCTS} products`);
  }

  const total = await prisma.product.count();
  console.log(`Done! Total products in DB: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
