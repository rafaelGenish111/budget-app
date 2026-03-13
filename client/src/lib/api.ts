import axios from 'axios'
import type {
  Entity,
  Category,
  Transaction,
  Budget,
  Account,
  DashboardData,
  MonthlyReport,
  YearlyReport,
} from '@/types'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export default api

// Entities
export const getEntities = (): Promise<Entity[]> => api.get('/entities').then((r) => r.data)

// Categories
export const getCategories = (): Promise<Category[]> => api.get('/categories').then((r) => r.data)
export const createCategory = (data: object) => api.post('/categories', data).then((r) => r.data)
export const updateCategory = (id: string, data: object) => api.put(`/categories/${id}`, data).then((r) => r.data)
export const deleteCategory = (id: string) => api.delete(`/categories/${id}`)

// Subcategories
export const createSubcategory = (data: object) => api.post('/subcategories', data).then((r) => r.data)
export const updateSubcategory = (id: string, data: object) => api.put(`/subcategories/${id}`, data).then((r) => r.data)
export const deleteSubcategory = (id: string) => api.delete(`/subcategories/${id}`)

// Transactions
export const getTransactions = (params?: object): Promise<Transaction[]> => api.get('/transactions', { params }).then((r) => r.data)
export const createTransaction = (data: object) => api.post('/transactions', data).then((r) => r.data)
export const updateTransaction = (id: string, data: object) => api.put(`/transactions/${id}`, data).then((r) => r.data)
export const deleteTransaction = (id: string) => api.delete(`/transactions/${id}`)

// Budgets
export const getBudgets = (params?: object): Promise<Budget[]> => api.get('/budgets', { params }).then((r) => r.data)
export const upsertBudget = (data: object) => api.put('/budgets', data).then((r) => r.data)

// Accounts
export const getAccounts = (params?: object): Promise<Account[]> => api.get('/accounts', { params }).then((r) => r.data)
export const createAccount = (data: object) => api.post('/accounts', data).then((r) => r.data)
export const updateAccount = (id: string, data: object) => api.put(`/accounts/${id}`, data).then((r) => r.data)
export const deleteAccount = (id: string) => api.delete(`/accounts/${id}`)

// Dashboard
export const getDashboard = (params?: object): Promise<DashboardData> => api.get('/dashboard', { params }).then((r) => r.data)

// Reports
export const getMonthlyReport = (params?: object): Promise<MonthlyReport> => api.get('/reports/monthly', { params }).then((r) => r.data)
export const getYearlyReport = (params?: object): Promise<YearlyReport> => api.get('/reports/yearly', { params }).then((r) => r.data)
