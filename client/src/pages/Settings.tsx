import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Tag,
  PiggyBank,
  Info,
  Check,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getBudgets,
  upsertBudget,
} from '@/lib/api'
import { useEntities } from '@/hooks/useEntities'
import { cn, getMonthName, ENTITY_LABELS } from '@/lib/utils'
import type { Category, CategoryType } from '@/types'

type SettingsTab = 'categories' | 'budgets' | 'account'

const TAB_LABELS: Record<SettingsTab, string> = {
  categories: 'קטגוריות',
  budgets: 'תקציב',
  account: 'חשבון',
}

const TAB_ICONS: Record<SettingsTab, React.ElementType> = {
  categories: Tag,
  budgets: PiggyBank,
  account: Info,
}

const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  EXPENSE: 'הוצאה',
  INCOME: 'הכנסה',
  BOTH: 'שניהם',
}

// ───── Categories Section ─────

function CategoriesSection() {
  const queryClient = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [catDialog, setCatDialog] = useState(false)
  const [editCat, setEditCat] = useState<Category | null>(null)
  const [catForm, setCatForm] = useState({ name: '', color: '#6366f1', type: 'EXPENSE' as CategoryType })
  const [subDialog, setSubDialog] = useState(false)
  const [subParentId, setSubParentId] = useState('')
  const [editSubId, setEditSubId] = useState<string | null>(null)
  const [subName, setSubName] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const openAddCat = () => {
    setEditCat(null)
    setCatForm({ name: '', color: '#6366f1', type: 'EXPENSE' })
    setCatDialog(true)
  }
  const openEditCat = (cat: Category) => {
    setEditCat(cat)
    setCatForm({ name: cat.name, color: cat.color, type: cat.type })
    setCatDialog(true)
  }

  const saveCat = async () => {
    if (!catForm.name.trim()) { toast.error('נא להזין שם'); return }
    setSaving(true)
    try {
      if (editCat) {
        await updateCategory(editCat.id, catForm)
        toast.success('הקטגוריה עודכנה')
      } else {
        await createCategory(catForm)
        toast.success('הקטגוריה נוספה')
      }
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      setCatDialog(false)
    } catch { toast.error('שגיאה') }
    finally { setSaving(false) }
  }

  const deleteCat = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return }
    try {
      await deleteCategory(id)
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('הקטגוריה נמחקה')
      setConfirmDelete(null)
    } catch { toast.error('שגיאה במחיקה') }
  }

  const openAddSub = (catId: string) => {
    setSubParentId(catId)
    setEditSubId(null)
    setSubName('')
    setSubDialog(true)
  }

  const openEditSub = (catId: string, subId: string, name: string) => {
    setSubParentId(catId)
    setEditSubId(subId)
    setSubName(name)
    setSubDialog(true)
  }

  const saveSub = async () => {
    if (!subName.trim()) { toast.error('נא להזין שם'); return }
    setSaving(true)
    try {
      if (editSubId) {
        await updateSubcategory(editSubId, { name: subName })
        toast.success('תת-הקטגוריה עודכנה')
      } else {
        await createSubcategory({ name: subName, categoryId: subParentId })
        toast.success('תת-הקטגוריה נוספה')
      }
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      setSubDialog(false)
    } catch { toast.error('שגיאה') }
    finally { setSaving(false) }
  }

  const deleteSub = async (subId: string) => {
    try {
      await deleteSubcategory(subId)
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      toast.success('נמחק')
    } catch { toast.error('שגיאה') }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 px-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-2 px-4">
        {categories.map((cat) => (
          <Card key={cat.id} className="overflow-hidden">
            {/* Category row */}
            <div className="flex items-center gap-3 p-3.5">
              <button
                onClick={() => setExpanded(expanded === cat.id ? null : cat.id)}
                className="flex items-center gap-3 flex-1 text-right"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-sm font-medium text-gray-800 flex-1">{cat.name}</span>
                <Badge variant="outline" className="text-xs">
                  {CATEGORY_TYPE_LABELS[cat.type]}
                </Badge>
                {expanded === cat.id ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEditCat(cat)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteCat(cat.id)}
                  className={cn(
                    'p-1.5 rounded-lg transition-colors',
                    confirmDelete === cat.id
                      ? 'bg-red-100 text-red-600'
                      : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
                  )}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expanded: subcategories */}
            {expanded === cat.id && (
              <div className="border-t border-gray-100 bg-gray-50 px-4 py-3 flex flex-col gap-2">
                {cat.subcategories.length === 0 ? (
                  <p className="text-xs text-gray-400">אין תת-קטגוריות</p>
                ) : (
                  cat.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between py-1"
                    >
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditSub(cat.id, sub.id, sub.name)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-700"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteSub(sub.id)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-xs text-gray-600">{sub.name}</span>
                    </div>
                  ))
                )}
                <button
                  onClick={() => openAddSub(cat.id)}
                  className="flex items-center justify-end gap-1.5 text-xs text-blue-600 hover:text-blue-700 pt-1"
                >
                  <span>הוסף תת-קטגוריה</span>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </Card>
        ))}

        <Button
          onClick={openAddCat}
          variant="outline"
          className="h-11 rounded-xl border-dashed gap-2"
        >
          <Plus className="w-4 h-4" />
          הוסף קטגוריה
        </Button>
      </div>

      {/* Category Dialog */}
      <Dialog open={catDialog} onOpenChange={(v) => !v && setCatDialog(false)}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editCat ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">שם</Label>
              <Input
                value={catForm.name}
                onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                placeholder="שם הקטגוריה"
                className="h-11 text-right"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">סוג</Label>
              <Select
                value={catForm.type}
                onValueChange={(v) => setCatForm({ ...catForm, type: v as CategoryType })}
              >
                <SelectTrigger className="h-11 text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(CATEGORY_TYPE_LABELS) as [CategoryType, string][]).map(
                    ([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">צבע</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={catForm.color}
                  onChange={(e) => setCatForm({ ...catForm, color: e.target.value })}
                  className="w-11 h-11 rounded-lg border border-gray-200 cursor-pointer"
                />
                <span className="text-sm text-gray-500">{catForm.color}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={saveCat}
              disabled={saving}
              className="h-11 bg-blue-600 hover:bg-blue-700 w-full rounded-xl"
            >
              {saving ? 'שומר...' : 'שמור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Subcategory Dialog */}
      <Dialog open={subDialog} onOpenChange={(v) => !v && setSubDialog(false)}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editSubId ? 'עריכת תת-קטגוריה' : 'תת-קטגוריה חדשה'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">שם</Label>
              <Input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="שם תת-הקטגוריה"
                className="h-11 text-right"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={saveSub}
              disabled={saving}
              className="h-11 bg-blue-600 hover:bg-blue-700 w-full rounded-xl"
            >
              {saving ? 'שומר...' : 'שמור'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

// ───── Budgets Section ─────

function BudgetsSection() {
  const queryClient = useQueryClient()
  const { entities } = useEntities()
  const now = new Date()
  const [selectedEntityId, setSelectedEntityId] = useState('')
  const [budgetAmounts, setBudgetAmounts] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: budgets = [], isLoading: loadingBudgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: getBudgets,
  })

  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const entityId = selectedEntityId || entities[0]?.id

  const getBudgetForCat = (catId: string) => {
    return budgets.find(
      (b) => b.categoryId === catId && b.entityId === entityId &&
             b.month === month && b.year === year
    )
  }

  const getAmountForCat = (catId: string): string => {
    if (budgetAmounts[catId] !== undefined) return budgetAmounts[catId]
    const b = getBudgetForCat(catId)
    return b ? String(b.amount) : ''
  }

  const saveBudget = async (catId: string) => {
    const val = budgetAmounts[catId]
    if (val === undefined || val === '') return
    const amount = Number(val)
    if (isNaN(amount) || amount < 0) { toast.error('סכום לא תקין'); return }
    setSavingId(catId)
    try {
      await upsertBudget({ entityId, categoryId: catId, amount, month, year })
      await queryClient.invalidateQueries({ queryKey: ['budgets'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('התקציב נשמר')
      setBudgetAmounts((prev) => { const n = { ...prev }; delete n[catId]; return n })
    } catch { toast.error('שגיאה') }
    finally { setSavingId(null) }
  }

  const expenseCategories = categories.filter(
    (c) => c.type === 'EXPENSE' || c.type === 'BOTH'
  )

  return (
    <div className="flex flex-col gap-4 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{getMonthName(month)} {year}</p>
        <Select value={entityId} onValueChange={(v) => setSelectedEntityId(v ?? '')}>
          <SelectTrigger className="w-36 h-9 text-xs">
            <SelectValue placeholder="בחר ישות" />
          </SelectTrigger>
          <SelectContent>
            {entities.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {ENTITY_LABELS[e.type] ?? e.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loadingCats || loadingBudgets ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {expenseCategories.map((cat) => {
            const amount = getAmountForCat(cat.id)
            const saved = getBudgetForCat(cat.id)
            const isDirty = budgetAmounts[cat.id] !== undefined

            return (
              <Card key={cat.id} className="p-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => saveBudget(cat.id)}
                    disabled={!isDirty || savingId === cat.id}
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                      isDirty
                        ? 'bg-blue-600 text-white'
                        : saved
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-400'
                    )}
                    aria-label="שמור תקציב"
                  >
                    {savingId === cat.id ? (
                      <span className="text-xs">...</span>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </button>

                  <div className="relative flex-1">
                    <Input
                      type="number"
                      inputMode="decimal"
                      value={amount}
                      onChange={(e) =>
                        setBudgetAmounts((prev) => ({ ...prev, [cat.id]: e.target.value }))
                      }
                      placeholder="0"
                      className="h-9 text-right pl-6 text-sm"
                    />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₪</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 w-28 justify-end">
                    <span className="text-sm font-medium text-gray-800 text-right">{cat.name}</span>
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ───── Account Section ─────

function AccountSection() {
  return (
    <Card className="mx-4 p-6 flex flex-col items-center gap-4 text-center">
      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
        <Info className="w-8 h-8 text-blue-600" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-gray-800 mb-1">אפליקציית תקציב</h3>
        <p className="text-sm text-gray-500">גרסה 1.0.0</p>
        <p className="text-sm text-gray-500 mt-1">ניהול תקציב משפחתי ועסקי</p>
      </div>
    </Card>
  )
}

// ───── Main Settings Page ─────

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('categories')

  return (
    <div className="flex flex-col gap-5 py-4 pb-8" dir="rtl">
      {/* Tab Selector */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mx-4">
        {(Object.entries(TAB_LABELS) as [SettingsTab, string][]).map(
          ([key, label]) => {
            const Icon = TAB_ICONS[key]
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all',
                  activeTab === key
                    ? 'bg-white text-blue-600 shadow-sm font-semibold'
                    : 'text-gray-500'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            )
          }
        )}
      </div>

      {/* Section Title */}
      <div className="px-4">
        <h2 className="text-base font-semibold text-gray-800">
          {TAB_LABELS[activeTab]}
        </h2>
      </div>

      {/* Active Section */}
      {activeTab === 'categories' && <CategoriesSection />}
      {activeTab === 'budgets' && <BudgetsSection />}
      {activeTab === 'account' && <AccountSection />}
    </div>
  )
}
