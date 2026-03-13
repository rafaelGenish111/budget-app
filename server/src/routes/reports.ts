import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

// Monthly detailed report
router.get('/monthly', async (req, res) => {
  const now = new Date()
  const { month = now.getMonth() + 1, year = now.getFullYear(), entityId } = req.query as Record<string, string>

  const m = parseInt(String(month))
  const y = parseInt(String(year))

  const fromDate = new Date(y, m - 1, 1)
  const toDate = new Date(y, m, 0, 23, 59, 59)

  const where: Record<string, unknown> = { date: { gte: fromDate, lte: toDate } }
  if (entityId) where.entityId = entityId

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true, subcategory: true, entity: true },
    orderBy: { date: 'asc' },
  })

  const totalIncome = transactions.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = transactions.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0)

  // By category breakdown
  const byCategory: Record<string, { name: string; color: string; icon: string | null; amount: number }> = {}
  for (const tx of transactions) {
    if (tx.type === 'EXPENSE' && tx.category) {
      const id = tx.categoryId!
      if (!byCategory[id]) {
        byCategory[id] = { name: tx.category.name, color: tx.category.color, icon: tx.category.icon, amount: 0 }
      }
      byCategory[id].amount += Number(tx.amount)
    }
  }

  res.json({
    month: m,
    year: y,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    byCategory: Object.values(byCategory).sort((a, b) => b.amount - a.amount),
    transactions,
  })
})

// Yearly summary (12 months bar chart data)
router.get('/yearly', async (req, res) => {
  const now = new Date()
  const { year = now.getFullYear(), entityId } = req.query as Record<string, string>
  const y = parseInt(String(year))

  const fromDate = new Date(y, 0, 1)
  const toDate = new Date(y, 11, 31, 23, 59, 59)

  const where: Record<string, unknown> = { date: { gte: fromDate, lte: toDate } }
  if (entityId) where.entityId = entityId

  const transactions = await prisma.transaction.findMany({ where })

  const months = Array.from({ length: 12 }, (_, i) => {
    const txs = transactions.filter((t) => new Date(t.date).getMonth() === i)
    return {
      month: i + 1,
      income: txs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0),
      expense: txs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0),
    }
  })

  res.json({ year: y, months })
})

export default router
