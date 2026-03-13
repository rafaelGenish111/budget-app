import { PrismaClient, CategoryType, EntityType, AccountType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed Entities
  const household = await prisma.entity.upsert({
    where: { type: EntityType.HOUSEHOLD },
    update: {},
    create: { name: 'בית', type: EntityType.HOUSEHOLD },
  })
  const rafaelBiz = await prisma.entity.upsert({
    where: { type: EntityType.RAFAEL_BIZ },
    update: {},
    create: { name: 'עסק רפאל', type: EntityType.RAFAEL_BIZ },
  })
  const leahBiz = await prisma.entity.upsert({
    where: { type: EntityType.LEAH_BIZ },
    update: {},
    create: { name: 'עסק לאה', type: EntityType.LEAH_BIZ },
  })

  console.log('Entities seeded:', household.name, rafaelBiz.name, leahBiz.name)

  // Seed Categories with subcategories
  const categories = [
    {
      name: 'מזון',
      icon: 'ShoppingCart',
      color: '#22c55e',
      type: CategoryType.EXPENSE,
      order: 1,
      subs: ['סופר', 'מכולת', 'השלמת קניות', 'ירקן', 'קצביה', 'מאפייה'],
    },
    {
      name: 'רכב',
      icon: 'Car',
      color: '#3b82f6',
      type: CategoryType.EXPENSE,
      order: 2,
      subs: ['דלק', 'חניה', 'ביטוח רכב', 'תחזוקה', 'חידוש רישיון', 'כביש 6'],
    },
    {
      name: 'ביגוד',
      icon: 'Shirt',
      color: '#a855f7',
      type: CategoryType.EXPENSE,
      order: 3,
      subs: ['ביגוד', 'נעלים', 'אביזרים'],
    },
    {
      name: 'בילויים',
      icon: 'PartyPopper',
      color: '#f59e0b',
      type: CategoryType.EXPENSE,
      order: 4,
      subs: ['מסעדות', 'קפה', 'קולנוע', 'חופשות', 'ספורט', 'אירועים'],
    },
    {
      name: 'ביטוחים',
      icon: 'Shield',
      color: '#06b6d4',
      type: CategoryType.EXPENSE,
      order: 5,
      subs: ['ביטוח בריאות', 'ביטוח חיים', 'ביטוח רכוש', 'ביטוח נסיעות'],
    },
    {
      name: 'שכירות',
      icon: 'Home',
      color: '#f97316',
      type: CategoryType.EXPENSE,
      order: 6,
      subs: ['שכר דירה', 'ארנונה', 'ועד בית'],
    },
    {
      name: 'חשבונות',
      icon: 'Zap',
      color: '#eab308',
      type: CategoryType.EXPENSE,
      order: 7,
      subs: ['חשמל', 'מים', 'גז', 'אינטרנט', 'טלפון', 'טלוויזיה'],
    },
    {
      name: 'מתנות',
      icon: 'Gift',
      color: '#ec4899',
      type: CategoryType.EXPENSE,
      order: 8,
      subs: ['מתנות', 'תרומות', 'אירועים משפחתיים'],
    },
    {
      name: 'חינוך',
      icon: 'BookOpen',
      color: '#8b5cf6',
      type: CategoryType.EXPENSE,
      order: 9,
      subs: ['שכר לימוד', 'ספרים', 'חוגים', 'קורסים'],
    },
    {
      name: 'בריאות',
      icon: 'Heart',
      color: '#ef4444',
      type: CategoryType.EXPENSE,
      order: 10,
      subs: ['תרופות', 'רופא', 'מרפאה', 'ספורט/כושר'],
    },
    {
      name: 'הכנסות',
      icon: 'TrendingUp',
      color: '#10b981',
      type: CategoryType.INCOME,
      order: 11,
      subs: ['משכורת', 'בונוס', 'פרילנס', 'שכ"ד', 'מתנות כסף'],
    },
    {
      name: 'הכנסות עסקיות',
      icon: 'Briefcase',
      color: '#0ea5e9',
      type: CategoryType.INCOME,
      order: 12,
      subs: ['הכנסות לקוח', 'פרויקט', 'ייעוץ', 'שונות'],
    },
    {
      name: 'הוצאות עסקיות',
      icon: 'Receipt',
      color: '#64748b',
      type: CategoryType.EXPENSE,
      order: 13,
      subs: ['ציוד', 'שיווק', 'תוכנה', 'נסיעות', 'הכשרה', 'שונות'],
    },
    {
      name: 'שונות',
      icon: 'MoreHorizontal',
      color: '#94a3b8',
      type: CategoryType.BOTH,
      order: 14,
      subs: ['כללי'],
    },
  ]

  for (const cat of categories) {
    const { subs, ...catData } = cat
    const existing = await prisma.category.findFirst({ where: { name: catData.name } })
    if (!existing) {
      const created = await prisma.category.create({
        data: {
          ...catData,
          subcategories: {
            create: subs.map((name) => ({ name })),
          },
        },
      })
      console.log('Category created:', created.name)
    }
  }

  // Seed sample accounts
  const accountsToSeed = [
    { name: 'חשבון עו"ש משפחתי', type: AccountType.CHECKING, balance: 0, entityId: household.id },
    { name: 'קרן חירום', type: AccountType.SAVINGS, balance: 0, entityId: household.id },
    { name: 'חשבון עסקי רפאל', type: AccountType.CHECKING, balance: 0, entityId: rafaelBiz.id },
    { name: 'חשבון עסקי לאה', type: AccountType.CHECKING, balance: 0, entityId: leahBiz.id },
  ]

  for (const acc of accountsToSeed) {
    const existing = await prisma.account.findFirst({ where: { name: acc.name } })
    if (!existing) {
      await prisma.account.create({ data: acc })
      console.log('Account created:', acc.name)
    }
  }

  console.log('Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
