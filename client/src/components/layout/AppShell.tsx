import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { getMonthName } from '@/lib/utils'

interface AppShellProps {
  children: ReactNode
  onAddClick: () => void
}

export function AppShell({ children, onAddClick }: AppShellProps) {
  const now = new Date()
  const monthName = getMonthName(now.getMonth() + 1)
  const year = now.getFullYear()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="rtl">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40"
        style={{ paddingTop: 'calc(env(safe-area-inset-top) + 12px)' }}
      >
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">תקציב</h1>
        <span className="text-sm text-gray-500 font-medium">
          {monthName} {year}
        </span>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav onAddClick={onAddClick} />
    </div>
  )
}
