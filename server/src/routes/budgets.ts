import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (req, res) => {
  const { month, year, entityId } = req.query as Record<string, string>
  const where: Record<string, unknown> = {}
  if (month) where.month = parseInt(month)
  if (year) where.year = parseInt(year)
  if (entityId) where.entityId = entityId

  const budgets = await prisma.budget.findMany({
    where,
    include: { category: true, entity: true },
  })
  res.json(budgets)
})

router.put('/', async (req, res) => {
  const { entityId, categoryId, amount, month, year } = req.body
  const budget = await prisma.budget.upsert({
    where: { entityId_categoryId_month_year: { entityId, categoryId, month, year } },
    update: { amount },
    create: { entityId, categoryId, amount, month, year },
    include: { category: true, entity: true },
  })
  res.json(budget)
})

export default router
