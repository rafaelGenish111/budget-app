import { MessageSquare } from 'lucide-react'
import { cn, formatCurrency, formatDateShort, ENTITY_LABELS } from '@/lib/utils'
import type { Transaction } from '@/types'

interface TransactionItemProps {
  transaction: Transaction
  onEdit: (t: Transaction) => void
}

export function TransactionItem({ transaction, onEdit }: TransactionItemProps) {
  const isIncome = transaction.type === 'INCOME'

  return (
    <button
      onClick={() => onEdit(transaction)}
      className="w-full flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors text-right"
    >
      {/* Category color dot */}
      <div className="shrink-0 flex items-center justify-center">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            backgroundColor: transaction.category?.color ?? '#9ca3af',
          }}
        />
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900 truncate">
            {transaction.category?.name ?? 'ללא קטגוריה'}
          </span>
          {transaction.subcategory && (
            <span className="text-xs text-gray-500 truncate">
              › {transaction.subcategory.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-400">
            {formatDateShort(transaction.date)}
          </span>
          <span
            className={cn(
              'text-xs px-1.5 py-0.5 rounded-full font-medium',
              transaction.entity.type === 'HOUSEHOLD'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-purple-100 text-purple-700'
            )}
          >
            {ENTITY_LABELS[transaction.entity.type] ?? transaction.entity.name}
          </span>
        </div>
      </div>

      {/* Amount + note icon */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span
          className={cn(
            'text-sm font-bold',
            isIncome ? 'text-green-600' : 'text-red-600'
          )}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </span>
        {transaction.note && (
          <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
        )}
      </div>
    </button>
  )
}
