import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (req, res) => {
  const { entityId } = req.query as Record<string, string>
  const accounts = await prisma.account.findMany({
    where: entityId ? { entityId } : {},
    include: { entity: true },
    orderBy: { createdAt: 'asc' },
  })
  res.json(accounts)
})

router.post('/', async (req, res) => {
  const { name, type, balance, entityId, note } = req.body
  const account = await prisma.account.create({
    data: { name, type, balance: balance || 0, entityId, note: note || null },
    include: { entity: true },
  })
  res.status(201).json(account)
})

router.put('/:id', async (req, res) => {
  const { name, type, balance, note } = req.body
  const account = await prisma.account.update({
    where: { id: req.params.id },
    data: { name, type, balance, note: note || null },
    include: { entity: true },
  })
  res.json(account)
})

router.delete('/:id', async (req, res) => {
  await prisma.account.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

export default router
