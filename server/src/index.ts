import express from 'express'
import cors from 'cors'
import entityRoutes from './routes/entities'
import categoryRoutes from './routes/categories'
import subcategoryRoutes from './routes/subcategories'
import transactionRoutes from './routes/transactions'
import budgetRoutes from './routes/budgets'
import accountRoutes from './routes/accounts'
import dashboardRoutes from './routes/dashboard'
import reportRoutes from './routes/reports'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',') : ['http://localhost:5173'],
  credentials: true,
}))
app.use(express.json())

app.use('/api/entities', entityRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/subcategories', subcategoryRoutes)
app.use('/api/transactions', transactionRoutes)
app.use('/api/budgets', budgetRoutes)
app.use('/api/accounts', accountRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/reports', reportRoutes)

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

export default app
