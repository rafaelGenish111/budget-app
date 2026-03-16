import { useState, useMemo } from 'react'
import { Receipt } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TransactionItem } from '@/components/transactions/TransactionItem'
import { EditTransactionDialog } from '@/components/transactions/EditTransactionDialog'
import { useTransactions } from '@/hooks/useTransactions'
import { useEntities } from '@/hooks/useEntities'
import { useCategories } from '@/hooks/useCategories'
import { formatDate, formatCurrency, getDateRange, ENTITY_LABELS, filterCategoriesByEntity, cn, type DateRange } from '@/lib/utils'
import type { Transaction } from '@/types'

type DateRangeKey = 'today' | 'week' | 'month' | 'year'

const DATE_RANGE_LABELS: Record<DateRangeKey, string> = {
  today: 'היום',
  week: 'שבוע',
  month: 'חודש',
  year: 'שנה',
}

const DATE_RANGE_MAP: Record<DateRangeKey, DateRange> = {
  today: 'day',
  week: 'week',
  month: 'month',
  year: 'year',
}

export default function Transactions() {
  const [rangeKey, setRangeKey] = useState<DateRangeKey>('month')
  const [entityFilter, setEntityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [editTx, setEditTx] = useState<Transaction | null>(null)

  const { entities } = useEntities()
  const { categories } = useCategories()

  const { from, to } = useMemo(() => getDateRange(DATE_RANGE_MAP[rangeKey]), [rangeKey])

  const { transactions, isLoading } = useTransactions({
    from,
    to,
    entityId: entityFilter !== 'all' ? entityFilter : undefined,
    categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
  })

  // Group transactions by date
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    for (const tx of transactions) {
      const key = tx.date.split('T')[0]
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(tx)
    }
    // Sort by date descending
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
  }, [transactions])

  return (
    <div className="flex flex-col" dir="rtl">
      {/* Date range tabs */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 pt-3 pb-2">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-3">
          {(Object.entries(DATE_RANGE_LABELS) as [DateRangeKey, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setRangeKey(key)}
                className={cn(
                  'flex-1 py-1.5 text-xs font-medium rounded-lg transition-all',
                  rangeKey === key
                    ? 'bg-white text-blue-600 shadow-sm font-semibold'
                    : 'text-gray-500'
                )}
              >
                {label}
              </button>
            )
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={entityFilter} onValueChange={(v) => setEntityFilter(v ?? 'all')}>
            <SelectTrigger className="flex-1 h-9 text-xs">
              <SelectValue placeholder="ישות" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הישויות</SelectItem>
              {entities.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {ENTITY_LABELS[e.type] ?? e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? 'all')}>
            <SelectTrigger className="flex-1 h-9 text-xs">
              <SelectValue placeholder="קטגוריה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">כל הקטגוריות</SelectItem>
              {filterCategoriesByEntity(
                categories,
                entities.find((e) => e.id === entityFilter)?.type
              ).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex flex-col gap-1 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 px-4 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
              <Receipt className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-base font-medium text-gray-600">אין עסקאות בתקופה זו</p>
            <p className="text-sm text-gray-400">שנה את הפילטרים או הוסף עסקה חדשה</p>
          </div>
        ) : (
          grouped.map(([dateKey, txs]) => {
            const dailyTotal = txs.reduce((acc, tx) => {
              return tx.type === 'INCOME' ? acc + tx.amount : acc - tx.amount
            }, 0)

            return (
              <div key={dateKey}>
                {/* Date header */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-y border-gray-100">
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      dailyTotal >= 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {dailyTotal >= 0 ? '+' : ''}
                    {formatCurrency(dailyTotal)}
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {formatDate(dateKey)}
                  </span>
                </div>

                {/* Transactions for that date */}
                <div className="bg-white divide-y divide-gray-50">
                  {txs.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      onEdit={setEditTx}
                    />
                  ))}
                </div>
              </div>
            )
          })
        )}
      </div>

      <EditTransactionDialog
        transaction={editTx}
        open={editTx !== null}
        onClose={() => setEditTx(null)}
      />
    </div>
  )
}
