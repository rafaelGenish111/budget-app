import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (req, res) => {
  const { entityId, from, to, categoryId, type, limit = '100', offset = '0' } = req.query as Record<string, string>

  const where: Record<string, unknown> = {}
  if (entityId) where.entityId = entityId
  if (categoryId) where.categoryId = categoryId
  if (type) where.type = type
  if (from || to) {
    where.date = {}
    if (from) (where.date as Record<string, unknown>).gte = new Date(from)
    if (to) (where.date as Record<string, unknown>).lte = new Date(to)
  }

  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: {
        entity: true,
        category: true,
        subcategory: true,
      },
      orderBy: { date: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    }),
    prisma.transaction.count({ where }),
  ])

  res.json({ transactions, total })
})

router.post('/', async (req, res) => {
  const { date, amount, type, entityId, categoryId, subcategoryId, note } = req.body
  const transaction = await prisma.transaction.create({
    data: {
      date: new Date(date),
      amount,
      type,
      entityId,
      categoryId: categoryId || null,
      subcategoryId: subcategoryId || null,
      note: note || null,
    },
    include: { entity: true, category: true, subcategory: true },
  })
  res.status(201).json(transaction)
})

router.put('/:id', async (req, res) => {
  const { date, amount, type, entityId, categoryId, subcategoryId, note } = req.body
  const transaction = await prisma.transaction.update({
    where: { id: req.params.id },
    data: {
      date: new Date(date),
      amount,
      type,
      entityId,
      categoryId: categoryId || null,
      subcategoryId: subcategoryId || null,
      note: note || null,
    },
    include: { entity: true, category: true, subcategory: true },
  })
  res.json(transaction)
})

router.delete('/:id', async (req, res) => {
  await prisma.transaction.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

export default router
