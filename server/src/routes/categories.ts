import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    include: { subcategories: { orderBy: { createdAt: 'asc' } } },
    orderBy: { order: 'asc' },
  })
  res.json(categories)
})

router.post('/', async (req, res) => {
  const { name, icon, color, type, order } = req.body
  const category = await prisma.category.create({
    data: { name, icon, color: color || '#6366f1', type: type || 'EXPENSE', order: order || 0 },
    include: { subcategories: true },
  })
  res.status(201).json(category)
})

router.put('/:id', async (req, res) => {
  const { name, icon, color, type, order } = req.body
  const category = await prisma.category.update({
    where: { id: req.params.id },
    data: { name, icon, color, type, order },
    include: { subcategories: true },
  })
  res.json(category)
})

router.delete('/:id', async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

export default router
