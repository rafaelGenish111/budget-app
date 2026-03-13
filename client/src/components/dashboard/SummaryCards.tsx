import { TrendingUp, TrendingDown, Scale } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatCurrency, cn } from '@/lib/utils'

interface SummaryCardsProps {
  income: number
  expense: number
  balance: number
}

export function SummaryCards({ income, expense, balance }: SummaryCardsProps) {
  const isPositive = balance >= 0

  return (
    <div className="grid grid-cols-3 gap-2.5 px-4">
      {/* Income */}
      <Card className="p-3 flex flex-col gap-1.5 bg-green-50 border-green-100">
        <div className="flex items-center justify-between">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-[10px] font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
            הכנסות
          </span>
        </div>
        <p className="text-sm font-bold text-green-700 leading-tight">
          {formatCurrency(income)}
        </p>
      </Card>

      {/* Expense */}
      <Card className="p-3 flex flex-col gap-1.5 bg-red-50 border-red-100">
        <div className="flex items-center justify-between">
          <TrendingDown className="w-4 h-4 text-red-600" />
          <span className="text-[10px] font-medium text-red-700 bg-red-100 px-1.5 py-0.5 rounded-full">
            הוצאות
          </span>
        </div>
        <p className="text-sm font-bold text-red-700 leading-tight">
          {formatCurrency(expense)}
        </p>
      </Card>

      {/* Balance */}
      <Card
        className={cn(
          'p-3 flex flex-col gap-1.5',
          isPositive
            ? 'bg-blue-50 border-blue-100'
            : 'bg-orange-50 border-orange-100'
        )}
      >
        <div className="flex items-center justify-between">
          <Scale
            className={cn(
              'w-4 h-4',
              isPositive ? 'text-blue-600' : 'text-orange-600'
            )}
          />
          <span
            className={cn(
              'text-[10px] font-medium px-1.5 py-0.5 rounded-full',
              isPositive
                ? 'text-blue-700 bg-blue-100'
                : 'text-orange-700 bg-orange-100'
            )}
          >
            מאזן
          </span>
        </div>
        <p
          className={cn(
            'text-sm font-bold leading-tight',
            isPositive ? 'text-blue-700' : 'text-orange-700'
          )}
        >
          {formatCurrency(balance)}
        </p>
      </Card>
    </div>
  )
}
