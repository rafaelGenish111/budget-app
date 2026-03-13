import { useState } from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { EntityTabs } from '@/components/dashboard/EntityTabs'
import { BudgetProgressList } from '@/components/dashboard/BudgetProgressList'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { useDashboard } from '@/hooks/useDashboard'
import { getMonthName } from '@/lib/utils'

export default function Dashboard() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [selectedEntity, setSelectedEntity] = useState('all')

  const { data, isLoading } = useDashboard({ month, year })

  const goToPrev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  const goToNext = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  // Compute filtered totals by entity
  const totals = data?.totals ?? { income: 0, expense: 0, balance: 0 }
  const entitySummary = data?.entitySummary ?? []

  const displayTotals =
    selectedEntity === 'all'
      ? totals
      : (() => {
          const es = entitySummary.find((e) => e.entity.id === selectedEntity)
          return es
            ? { income: es.income, expense: es.expense, balance: es.balance }
            : totals
        })()

  return (
    <div className="flex flex-col gap-5 py-4">
      {/* Month/Year Selector */}
      <div className="flex items-center justify-center gap-4 px-4">
        <button
          onClick={goToNext}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="חודש הבא"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>

        <h2 className="text-lg font-bold text-gray-900 min-w-[120px] text-center">
          {getMonthName(month)} {year}
        </h2>

        <button
          onClick={goToPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors"
          aria-label="חודש קודם"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Entity Tabs */}
      {isLoading ? (
        <div className="px-4">
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ) : (
        <EntityTabs
          entitySummary={entitySummary}
          totals={totals}
          selected={selectedEntity}
          onChange={setSelectedEntity}
        />
      )}

      {/* Summary Cards */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-2.5 px-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : (
        <SummaryCards
          income={displayTotals.income}
          expense={displayTotals.expense}
          balance={displayTotals.balance}
        />
      )}

      {/* Budget Progress */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-sm font-semibold text-gray-700">תקציב חודשי</h3>
        </div>
        {isLoading ? (
          <div className="px-4 flex flex-col gap-2">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        ) : (
          <BudgetProgressList items={data?.budgetProgress ?? []} />
        )}
      </div>

      {/* Recent Transactions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-sm font-semibold text-gray-700">עסקאות אחרונות</h3>
        </div>
        {isLoading ? (
          <div className="px-4 flex flex-col gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))}
          </div>
        ) : (
          <RecentTransactions transactions={data?.recentTransactions ?? []} />
        )}
      </div>
    </div>
  )
}
