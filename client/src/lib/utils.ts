import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import {
  format,
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfYear, endOfYear,
} from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy')
}

export function formatDateShort(date: string | Date): string {
  return format(new Date(date), 'dd/MM')
}

export const HEBREW_MONTHS = [
  'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

export function getMonthName(month: number): string {
  return HEBREW_MONTHS[month - 1]
}

export type DateRange = 'day' | 'week' | 'month' | 'year'

export function getDateRange(range: DateRange, date = new Date()): { from: string; to: string } {
  let from: Date, to: Date
  switch (range) {
    case 'day':
      from = startOfDay(date); to = endOfDay(date); break
    case 'week':
      from = startOfWeek(date, { weekStartsOn: 0 }); to = endOfWeek(date, { weekStartsOn: 0 }); break
    case 'month':
      from = startOfMonth(date); to = endOfMonth(date); break
    case 'year':
      from = startOfYear(date); to = endOfYear(date); break
    default:
      from = startOfMonth(date); to = endOfMonth(date)
  }
  return { from: from.toISOString(), to: to.toISOString() }
}

export const ENTITY_LABELS: Record<string, string> = {
  HOUSEHOLD: 'בית',
  RAFAEL_BIZ: 'עסק רפאל',
  LEAH_BIZ: 'עסק לאה',
}

export function getEntityScope(entityType?: string): 'HOUSEHOLD' | 'BUSINESS' | null {
  if (!entityType) return null
  if (entityType === 'HOUSEHOLD') return 'HOUSEHOLD'
  if (entityType === 'RAFAEL_BIZ' || entityType === 'LEAH_BIZ') return 'BUSINESS'
  return null
}

export function filterCategoriesByEntity(
  categories: { entityScope: string }[],
  entityType?: string
) {
  const scope = getEntityScope(entityType)
  if (!scope) return categories
  return categories.filter(
    (c) => c.entityScope === scope || c.entityScope === 'ALL'
  )
}

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  SAVINGS: 'חסכון',
  DEPOSIT: 'פקדון',
  LOAN: 'הלוואה',
  CHECKING: 'עו"ש',
}
