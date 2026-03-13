export type EntityType = 'HOUSEHOLD' | 'RAFAEL_BIZ' | 'LEAH_BIZ'
export type CategoryType = 'EXPENSE' | 'INCOME' | 'BOTH'
export type TxType = 'INCOME' | 'EXPENSE'
export type AccountType = 'SAVINGS' | 'DEPOSIT' | 'LOAN' | 'CHECKING'

export interface Entity {
  id: string
  name: string
  type: EntityType
  createdAt: string
}

export interface Subcategory {
  id: string
  name: string
  categoryId: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string | null
  color: string
  type: CategoryType
  order: number
  subcategories: Subcategory[]
  createdAt: string
}

export interface Transaction {
  id: string
  date: string
  amount: number
  type: TxType
  entityId: string
  entity: Entity
  categoryId: string | null
  category: Category | null
  subcategoryId: string | null
  subcategory: Subcategory | null
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  entityId: string
  entity: Entity
  categoryId: string
  category: Category
  amount: number
  month: number
  year: number
}

export interface Account {
  id: string
  name: string
  type: AccountType
  balance: number
  entityId: string
  entity: Entity
  note: string | null
  createdAt: string
  updatedAt: string
}

export interface BudgetProgress {
  budget: Budget
  spent: number
  percent: number
}

export interface EntitySummary {
  entity: Entity
  income: number
  expense: number
  balance: number
}

export interface DashboardData {
  month: number
  year: number
  totals: { income: number; expense: number; balance: number }
  entitySummary: EntitySummary[]
  budgetProgress: BudgetProgress[]
  recentTransactions: Transaction[]
}

export interface MonthlyReport {
  month: number
  year: number
  totalIncome: number
  totalExpense: number
  balance: number
  byCategory: { name: string; color: string; icon: string | null; amount: number }[]
  transactions: Transaction[]
}

export interface YearlyReport {
  year: number
  months: { month: number; income: number; expense: number }[]
}
