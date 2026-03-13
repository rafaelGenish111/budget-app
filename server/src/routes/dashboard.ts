import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'

const router = Router()

router.get('/', async (req, res) => {
  const now = new Date()
  const { month = now.getMonth() + 1, year = now.getFullYear() } = req.query as Record<string, string>

  const m = parseInt(String(month))
  const y = parseInt(String(year))

  const fromDate = new Date(y, m - 1, 1)
  const toDate = new Date(y, m, 0, 23, 59, 59)

  const [entities, transactions, budgets] = await Promise.all([
    prisma.entity.findMany(),
    prisma.transaction.findMany({
      where: { date: { gte: fromDate, lte: toDate } },
      include: { category: true, entity: true },
    }),
    prisma.budget.findMany({
      where: { month: m, year: y },
      include: { category: true, entity: true },
    }),
  ])

  // Build per-entity summary
  const entitySummary = entities.map((entity) => {
    const entityTxs = transactions.filter((t) => t.entityId === entity.id)
    const income = entityTxs
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const expense = entityTxs
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    return { entity, income, expense, balance: income - expense }
  })

  // Budget progress per category (all entities combined)
  const categorySpend: Record<string, number> = {}
  for (const tx of transactions) {
    if (tx.type === 'EXPENSE' && tx.categoryId) {
      categorySpend[tx.categoryId] = (categorySpend[tx.categoryId] || 0) + Number(tx.amount)
    }
  }

  const budgetProgress = budgets.map((b) => ({
    budget: b,
    spent: categorySpend[b.categoryId] || 0,
    percent: Number(b.amount) > 0 ? Math.round(((categorySpend[b.categoryId] || 0) / Number(b.amount)) * 100) : 0,
  }))

  // Recent 10 transactions
  const recent = transactions.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)

  // Totals
  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)

  res.json({
    month: m,
    year: y,
    totals: { income: totalIncome, expense: totalExpense, balance: totalIncome - totalExpense },
    entitySummary,
    budgetProgress,
    recentTransactions: recent,
  })
})

export default router
