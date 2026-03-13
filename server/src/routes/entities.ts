import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  const entities = await prisma.entity.findMany({ orderBy: { createdAt: 'asc' } })
  res.json(entities)
})

export default router
