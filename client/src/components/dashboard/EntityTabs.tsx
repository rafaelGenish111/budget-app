import { formatCurrency, cn, ENTITY_LABELS } from '@/lib/utils'
import type { EntitySummary } from '@/types'

interface EntityTabsProps {
  entitySummary: EntitySummary[]
  totals: { income: number; expense: number; balance: number }
  selected: string
  onChange: (v: string) => void
}

export function EntityTabs({
  entitySummary,
  totals,
  selected,
  onChange,
}: EntityTabsProps) {
  const currentSummary =
    selected === 'all'
      ? null
      : entitySummary.find((e) => e.entity.id === selected)

  const displayData =
    selected === 'all'
      ? totals
      : currentSummary
        ? {
            income: currentSummary.income,
            expense: currentSummary.expense,
            balance: currentSummary.balance,
          }
        : totals

  const tabs = [
    { value: 'all', label: 'הכל' },
    ...entitySummary.map((es) => ({
      value: es.entity.id,
      label: ENTITY_LABELS[es.entity.type] ?? es.entity.name,
    })),
  ]

  return (
    <div className="px-4 flex flex-col gap-3">
      <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              'flex-1 py-2 text-xs font-medium rounded-lg transition-all',
              selected === tab.value
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mini summary row */}
      <div className="flex justify-between text-xs text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-gray-400">הכנסות</span>
          <span className="font-semibold text-green-600">
            {formatCurrency(displayData.income)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-gray-400">הוצאות</span>
          <span className="font-semibold text-red-600">
            {formatCurrency(displayData.expense)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-gray-400">מאזן</span>
          <span
            className={cn(
              'font-semibold',
              displayData.balance >= 0 ? 'text-blue-600' : 'text-orange-600'
            )}
          >
            {formatCurrency(displayData.balance)}
          </span>
        </div>
      </div>
    </div>
  )
}
