import { useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, CirclePlus, BarChart3, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BottomNavProps {
  onAddClick: () => void
}

const navItems = [
  { icon: LayoutDashboard, label: 'ראשי', path: '/' },
  { icon: ArrowLeftRight, label: 'עסקאות', path: '/transactions' },
  { icon: null, label: 'הוסף', path: null },
  { icon: BarChart3, label: 'דוחות', path: '/reports' },
  { icon: Settings, label: 'הגדרות', path: '/settings' },
]

export function BottomNav({ onAddClick }: BottomNavProps) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb overflow-visible"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-end justify-around h-16 overflow-visible">
        {navItems.map((item, _index) => {
          if (item.path === null) {
            return (
              <button
                key="add"
                onClick={onAddClick}
                className="flex flex-col items-center justify-center -mt-5 focus:outline-none"
                aria-label="הוסף עסקה"
              >
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 active:scale-95 transition-transform">
                  <CirclePlus className="w-7 h-7 text-white" />
                </div>
              </button>
            )
          }

          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)

          const Icon = item.icon!

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path!)}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 focus:outline-none transition-colors',
                isActive ? 'text-blue-600' : 'text-gray-400'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
