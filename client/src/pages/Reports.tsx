import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { getMonthlyReport, getYearlyReport } from '@/lib/api'
import { getMonthName, formatCurrency } from '@/lib/utils'

const HEBREW_MONTH_SHORT = [
  'ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני',
  'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ',
]

export default function Reports() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const goToPrev = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  const goToNext = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const { data: monthly, isLoading: loadingMonthly } = useQuery({
    queryKey: ['monthly-report', month, year],
    queryFn: () => getMonthlyReport({ month, year }),
  })

  const { data: yearly, isLoading: loadingYearly } = useQuery({
    queryKey: ['yearly-report', year],
    queryFn: () => getYearlyReport({ year }),
  })

  const pieData = (monthly?.byCategory ?? [])
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8)

  const barData = (yearly?.months ?? []).map((m) => ({
    name: HEBREW_MONTH_SHORT[m.month - 1],
    הכנסות: m.income,
    הוצאות: m.expense,
  }))

  return (
    <div className="flex flex-col gap-5 py-4" dir="rtl">
      {/* Month/Year Selector */}
      <div className="flex items-center justify-center gap-4 px-4">
        <button
          onClick={goToNext}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200"
          aria-label="חודש הבא"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-lg font-bold text-gray-900 min-w-[120px] text-center">
          {getMonthName(month)} {year}
        </h2>
        <button
          onClick={goToPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200"
          aria-label="חודש קודם"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Summary Cards */}
      {loadingMonthly ? (
        <div className="grid grid-cols-3 gap-2.5 px-4">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : (
        <SummaryCards
          income={monthly?.totalIncome ?? 0}
          expense={monthly?.totalExpense ?? 0}
          balance={monthly?.balance ?? 0}
        />
      )}

      {/* Pie Chart: Expense by Category */}
      <Card className="mx-4 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">הוצאות לפי קטגוריה</h3>
        {loadingMonthly ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : pieData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">אין נתונים לתצוגה</p>
        ) : (
          <div className="flex flex-col gap-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="amount"
                  nameKey="name"
                >
                  {pieData.map((entry, _index) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => formatCurrency(value as number)}
                  contentStyle={{ direction: 'rtl', fontFamily: 'Rubik' }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Custom Hebrew Legend */}
            <div className="flex flex-col gap-1.5">
              {pieData.map((entry) => {
                const pct = monthly?.totalExpense
                  ? Math.round((entry.amount / monthly.totalExpense) * 100)
                  : 0
                return (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-600">
                      {formatCurrency(entry.amount)}
                      <span className="text-gray-400 mr-1">({pct}%)</span>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-700">{entry.name}</span>
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      {/* Bar Chart: 12 months */}
      <Card className="mx-4 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          הכנסות מול הוצאות — {year}
        </h3>
        {loadingYearly ? (
          <Skeleton className="h-48 w-full rounded-xl" />
        ) : barData.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">אין נתונים לתצוגה</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={barData}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fontFamily: 'Rubik', fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fontFamily: 'Rubik', fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [formatCurrency(value as number), name as string]}
                contentStyle={{ direction: 'rtl', fontFamily: 'Rubik', fontSize: 12 }}
              />
              <Legend
                wrapperStyle={{ fontFamily: 'Rubik', fontSize: 11, direction: 'rtl' }}
              />
              <Bar dataKey="הכנסות" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={20} />
              <Bar dataKey="הוצאות" fill="#ef4444" radius={[3, 3, 0, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
