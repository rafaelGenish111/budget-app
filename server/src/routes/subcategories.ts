import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.post('/', async (req, res) => {
  const { name, categoryId } = req.body
  const sub = await prisma.subcategory.create({ data: { name, categoryId } })
  res.status(201).json(sub)
})

router.put('/:id', async (req, res) => {
  const { name } = req.body
  const sub = await prisma.subcategory.update({ where: { id: req.params.id }, data: { name } })
  res.json(sub)
})

router.delete('/:id', async (req, res) => {
  await prisma.subcategory.delete({ where: { id: req.params.id } })
  res.status(204).end()
})

export default router
