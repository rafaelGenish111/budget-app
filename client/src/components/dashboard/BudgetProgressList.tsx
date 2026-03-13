import { PiggyBank } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, cn } from '@/lib/utils'
import type { BudgetProgress } from '@/types'

interface BudgetProgressListProps {
  items: BudgetProgress[]
}

function getProgressColor(percent: number): string {
  if (percent >= 90) return 'bg-red-500'
  if (percent >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

function getBadgeVariant(percent: number) {
  if (percent >= 90) return 'destructive' as const
  if (percent >= 70) return 'secondary' as const
  return 'outline' as const
}

export function BudgetProgressList({ items }: BudgetProgressListProps) {
  if (items.length === 0) {
    return (
      <div className="px-4">
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <PiggyBank className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500">לא הוגדרו תקציבים לחודש זה</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 flex flex-col gap-2">
      {items.map((item) => {
        const percent = Math.min(item.percent, 100)
        const colorClass = getProgressColor(item.percent)
        const badgeVariant = getBadgeVariant(item.percent)

        return (
          <Card
            key={item.budget.id}
            className="p-3.5 flex flex-col gap-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: item.budget.category.color }}
                />
                <span className="text-sm font-medium text-gray-800">
                  {item.budget.category.name}
                </span>
              </div>
              <Badge
                variant={badgeVariant}
                className={cn(
                  'text-xs font-semibold',
                  item.percent >= 90 && 'bg-red-100 text-red-700 border-red-200',
                  item.percent >= 70 && item.percent < 90 && 'bg-yellow-100 text-yellow-700 border-yellow-200',
                  item.percent < 70 && 'bg-green-100 text-green-700 border-green-200'
                )}
              >
                {Math.round(item.percent)}%
              </Badge>
            </div>

            {/* Progress bar */}
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', colorClass)}
                style={{ width: `${percent}%` }}
              />
            </div>

            {/* Amounts */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">
                  {formatCurrency(item.spent)}
                </span>
                {' '}מתוך{' '}
                <span className="font-medium text-gray-700">
                  {formatCurrency(item.budget.amount)}
                </span>
              </span>
              {item.spent > item.budget.amount && (
                <span className="text-xs text-red-600 font-medium">
                  חריגה: {formatCurrency(item.spent - item.budget.amount)}
                </span>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
