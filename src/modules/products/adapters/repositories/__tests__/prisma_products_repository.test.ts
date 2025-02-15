import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { PrismaProductsRepository } from '../prisma_products_repository';
import { Product } from '../../../domain/models';

describe('PrismaProductsRepository', () => {
  let container: StartedPostgreSqlContainer;
  let prisma: PrismaClient;

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();

    // process.env.DATABASE_URL = container.getConnectionUri();
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: container.getConnectionUri(),
        },
      },
    });

    await prisma.$connect();

    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: container.getConnectionUri() },
    });

    await prisma.categories.createMany({
      data: [
        { name: 'test 1', id: 1 },
        { name: 'test 2', id: 2 },
      ],
    });

    await prisma.products.createMany({
      data: [
        { name: 'test 2', description: 'test 2', price: 10, categoryId: 1 },
        { name: 'test 3', description: 'test 3', price: 10, categoryId: 1 },
      ]
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await container.stop();
  });

  it('should save the product successfully', async () => {
    // given
    const product = new Product('test', 'test', 10, 2);
    const repository = new PrismaProductsRepository(prisma);

    // when
    const saved = await repository.Save(product);

    // then
    expect(saved.name).toBe(product.name);
  });
});
