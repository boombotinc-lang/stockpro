import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'Empresa Demo',
      slug: 'demo',
      plan: 'PRO',
      maxUsers: 10,
      maxProducts: 999999,
    },
  })
  console.log('Created org:', org.slug)

  // 2. Create admin profile (must match a Supabase auth user)
  // Note: In real usage, the profile is created by the Supabase trigger.
  // For seed, we create it manually. The ID should match the auth.users id.
  const adminId = '00000000-0000-0000-0000-000000000001'
  const profile = await prisma.profile.create({
    data: {
      id: adminId,
      email: 'admin@demo.com',
      fullName: 'Admin Demo',
    },
  })
  console.log('Created profile:', profile.email)

  // 3. Add admin as OWNER
  await prisma.orgMember.create({
    data: {
      orgId: org.id,
      userId: adminId,
      role: 'OWNER',
    },
  })

  // 4. Create categories
  const [catEletronicos, catVestuario, catAlimentos] = await Promise.all([
    prisma.category.create({
      data: { orgId: org.id, name: 'Eletrônicos', color: '#3B82F6' },
    }),
    prisma.category.create({
      data: { orgId: org.id, name: 'Vestuário', color: '#10B981' },
    }),
    prisma.category.create({
      data: { orgId: org.id, name: 'Alimentos', color: '#F59E0B' },
    }),
  ])
  console.log('Created 3 categories')

  // 5. Create default stock location
  const location = await prisma.stockLocation.create({
    data: {
      orgId: org.id,
      name: 'Depósito Principal',
      isDefault: true,
    },
  })

  // 6. Create 5 products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        orgId: org.id,
        categoryId: catEletronicos.id,
        sku: 'ELET-001',
        name: 'Fone Bluetooth',
        description: 'Fone de ouvido sem fio com cancelamento de ruído',
        costPrice: new Prisma.Decimal(45.00),
        salePrice: new Prisma.Decimal(129.90),
        minStock: 10,
        createdById: adminId,
      },
    }),
    prisma.product.create({
      data: {
        orgId: org.id,
        categoryId: catEletronicos.id,
        sku: 'ELET-002',
        name: 'Carregador USB-C',
        description: 'Carregador rápido 65W',
        costPrice: new Prisma.Decimal(25.00),
        salePrice: new Prisma.Decimal(79.90),
        minStock: 20,
        createdById: adminId,
      },
    }),
    prisma.product.create({
      data: {
        orgId: org.id,
        categoryId: catVestuario.id,
        sku: 'VEST-001',
        name: 'Camiseta Básica P',
        description: 'Camiseta algodão tamanho P',
        costPrice: new Prisma.Decimal(15.00),
        salePrice: new Prisma.Decimal(49.90),
        minStock: 30,
        createdById: adminId,
      },
    }),
    prisma.product.create({
      data: {
        orgId: org.id,
        categoryId: catVestuario.id,
        sku: 'VEST-002',
        name: 'Calça Jeans M',
        description: 'Calça jeans slim tamanho M',
        costPrice: new Prisma.Decimal(40.00),
        salePrice: new Prisma.Decimal(149.90),
        minStock: 15,
        createdById: adminId,
      },
    }),
    prisma.product.create({
      data: {
        orgId: org.id,
        categoryId: catAlimentos.id,
        sku: 'ALIM-001',
        name: 'Café Premium 500g',
        description: 'Café torrado e moído premium',
        costPrice: new Prisma.Decimal(18.00),
        salePrice: new Prisma.Decimal(39.90),
        minStock: 50,
        createdById: adminId,
      },
    }),
  ])
  console.log('Created 5 products')

  // 7. Create stock movements
  const movements = [
    { productIdx: 0, type: 'IN' as const, qty: 50 },
    { productIdx: 1, type: 'IN' as const, qty: 100 },
    { productIdx: 2, type: 'IN' as const, qty: 80 },
    { productIdx: 3, type: 'IN' as const, qty: 40 },
    { productIdx: 4, type: 'IN' as const, qty: 200 },
    { productIdx: 0, type: 'OUT' as const, qty: -5 },
    { productIdx: 1, type: 'OUT' as const, qty: -12 },
    { productIdx: 2, type: 'OUT' as const, qty: -20 },
    { productIdx: 3, type: 'OUT' as const, qty: -8 },
    { productIdx: 4, type: 'OUT' as const, qty: -30 },
  ]

  const stockByProduct: Record<number, number> = {}
  for (const mov of movements) {
    const before = stockByProduct[mov.productIdx] ?? 0
    const after = before + mov.qty
    stockByProduct[mov.productIdx] = after

    await prisma.stockMovement.create({
      data: {
        orgId: org.id,
        productId: products[mov.productIdx].id,
        locationId: location.id,
        type: mov.type,
        quantity: mov.qty,
        stockBefore: before,
        stockAfter: after,
        performedById: adminId,
      },
    })
  }
  console.log('Created 10 stock movements')

  // 8. Create cash flow categories
  const [cfVendas, cfCompras] = await Promise.all([
    prisma.cashFlowCategory.create({
      data: { orgId: org.id, name: 'Vendas', type: 'INCOME', color: '#10B981', isDefault: true },
    }),
    prisma.cashFlowCategory.create({
      data: { orgId: org.id, name: 'Compras de Estoque', type: 'EXPENSE', color: '#EF4444', isDefault: true },
    }),
  ])

  // 9. Create cash flow entries
  const today = new Date()
  const cashFlowEntries = [
    { type: 'INCOME' as const, amount: 1299.00, desc: 'Venda lote fones', catId: cfVendas.id, daysAgo: 1 },
    { type: 'EXPENSE' as const, amount: 2250.00, desc: 'Reposição estoque eletrônicos', catId: cfCompras.id, daysAgo: 3 },
    { type: 'INCOME' as const, amount: 749.50, desc: 'Venda vestuário', catId: cfVendas.id, daysAgo: 5 },
    { type: 'EXPENSE' as const, amount: 3600.00, desc: 'Compra café atacado', catId: cfCompras.id, daysAgo: 7 },
    { type: 'INCOME' as const, amount: 2497.50, desc: 'Vendas diversas semana', catId: cfVendas.id, daysAgo: 10 },
  ]

  for (const entry of cashFlowEntries) {
    const occurredAt = new Date(today)
    occurredAt.setDate(occurredAt.getDate() - entry.daysAgo)

    await prisma.cashFlowEntry.create({
      data: {
        orgId: org.id,
        categoryId: entry.catId,
        type: entry.type,
        amount: new Prisma.Decimal(entry.amount),
        description: entry.desc,
        occurredAt,
        createdById: adminId,
      },
    })
  }
  console.log('Created 5 cash flow entries')

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
