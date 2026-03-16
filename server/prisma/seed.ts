import { PrismaClient, CategoryType, EntityType, AccountType, EntityScope } from '@prisma/client'

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
    // === Household categories ===
    {
      name: 'מזון',
      icon: 'ShoppingCart',
      color: '#22c55e',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.HOUSEHOLD,
      order: 1,
      subs: ['סופר', 'מכולת', 'השלמת קניות', 'ירקן', 'קצביה', 'מאפייה'],
    },
    {
      name: 'רכב',
      icon: 'Car',
      color: '#3b82f6',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.HOUSEHOLD,
      order: 2,
      subs: ['דלק', 'חניה', 'ביטוח רכב', 'תחזוקה', 'חידוש רישיון', 'כביש 6'],
    },
    {
      name: 'ביגוד',
      icon: 'Shirt',
      color: '#a855f7',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.HOUSEHOLD,
      order: 3,
      subs: ['ביגוד', 'נעלים', 'אביזרים'],
    },
    {
      name: 'בילויים',
      icon: 'PartyPopper',
      color: '#f59e0b',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.HOUSEHOLD,
      order: 4,
      subs: ['מסעדות', 'קפה', 'קולנוע', 'חופשות', 'ספורט', 'אירועים'],
    },
    {
      name: 'ביטוחים',
      icon: 'Shield',
      color: '#06b6d4',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.HOUSEHOLD,
      order: 5,
      subs: ['ביטוח בריאות', 'ביטוח חיים', 'ביטוח רכוש', 'ביטוח נסיעות'],
    },
    {
      name: 'דיור',
      icon: 'Home',
      color: '#f97316',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.HOUSEHOLD,
      order: 6,
      subs: ['שכר דירה', 'ארנונה', 'ועד בית', 'תיקונים', 'ריהוט'],
    },
    {
      name: 'חשבונות בית',
      icon: 'Zap',
      color: '#eab308',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.HOUSEHOLD,
      order: 7,
      subs: ['חשמל', 'מים', 'גז', 'אינטרנט', 'טלפון', 'טלוויזיה'],
    },
    {
      name: 'מתנות',
      icon: 'Gift',
      color: '#ec4899',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.HOUSEHOLD,
      order: 8,
      subs: ['מתנות', 'תרומות', 'אירועים משפחתיים'],
    },
    {
      name: 'חינוך',
      icon: 'BookOpen',
      color: '#8b5cf6',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.HOUSEHOLD,
      order: 9,
      subs: ['שכר לימוד', 'ספרים', 'חוגים', 'קורסים', 'גן ילדים'],
    },
    {
      name: 'בריאות',
      icon: 'Heart',
      color: '#ef4444',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.HOUSEHOLD,
      order: 10,
      subs: ['תרופות', 'רופא', 'מרפאה', 'ספורט/כושר', 'רופא שיניים'],
    },
    {
      name: 'הכנסות',
      icon: 'TrendingUp',
      color: '#10b981',
      type: CategoryType.INCOME,
      entityScope: EntityScope.HOUSEHOLD,
      order: 11,
      subs: ['משכורת', 'בונוס', 'פרילנס', 'שכ"ד', 'מתנות כסף', 'קצבאות'],
    },

    // === Business categories ===
    {
      name: 'הכנסות עסקיות',
      icon: 'Briefcase',
      color: '#0ea5e9',
      type: CategoryType.INCOME,
      entityScope: EntityScope.BUSINESS,
      order: 20,
      subs: ['הכנסות לקוח', 'פרויקט', 'ייעוץ', 'מכירות', 'שונות'],
    },
    {
      name: 'חשבונות עסק',
      icon: 'Zap',
      color: '#eab308',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.BUSINESS,
      order: 21,
      subs: ['חשמל', 'מים', 'אינטרנט', 'טלפון'],
    },
    {
      name: 'שכירות עסק',
      icon: 'Building2',
      color: '#f97316',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.BUSINESS,
      order: 22,
      subs: ['שכירות משרד', 'ארנונה', 'ועד בניין'],
    },
    {
      name: 'רואה חשבון',
      icon: 'Calculator',
      color: '#6366f1',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.BUSINESS,
      order: 23,
      subs: ['הנהלת חשבונות', 'ייעוץ מס', 'דוחות שנתיים'],
    },
    {
      name: 'לימודים והכשרות',
      icon: 'GraduationCap',
      color: '#8b5cf6',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.BUSINESS,
      order: 24,
      subs: ['קורסים', 'כנסים', 'הדרכות', 'ספרות מקצועית'],
    },
    {
      name: 'ביטוחים עסקיים',
      icon: 'Shield',
      color: '#06b6d4',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.BUSINESS,
      order: 25,
      subs: ['ביטוח אחריות', 'ביטוח עסק', 'ביטוח ציוד'],
    },
    {
      name: 'ציוד ותוכנה',
      icon: 'Monitor',
      color: '#64748b',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.BUSINESS,
      order: 26,
      subs: ['ציוד משרדי', 'מחשבים', 'תוכנה', 'אחסון ענן'],
    },
    {
      name: 'שיווק ופרסום',
      icon: 'Megaphone',
      color: '#e11d48',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.BUSINESS,
      order: 27,
      subs: ['פרסום דיגיטלי', 'עיצוב', 'אתר', 'דפוס'],
    },
    {
      name: 'נסיעות עסקיות',
      icon: 'Plane',
      color: '#0d9488',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.BUSINESS,
      order: 28,
      subs: ['דלק', 'חניה', 'טיסות', 'לינה'],
    },
    {
      name: 'הוצאות עסקיות אחרות',
      icon: 'Receipt',
      color: '#94a3b8',
      type: CategoryType.EXPENSE,
      entityScope: EntityScope.BUSINESS,
      order: 29,
      subs: ['כיבוד', 'משפטי', 'רשיונות', 'שונות'],
    },

    // === Shared categories ===
    {
      name: 'שונות',
      icon: 'MoreHorizontal',
      color: '#94a3b8',
      type: CategoryType.BOTH,
      entityScope: EntityScope.ALL,
      order: 99,
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
    } else {
      // Update entityScope for existing categories
      await prisma.category.update({
        where: { id: existing.id },
        data: { entityScope: catData.entityScope },
      })
      console.log('Category updated:', existing.name)
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
