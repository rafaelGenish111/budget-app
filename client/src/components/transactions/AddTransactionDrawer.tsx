import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  House,
  Briefcase,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Check,
  CalendarDays,
  FileText,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useCategories } from '@/hooks/useCategories'
import { useEntities } from '@/hooks/useEntities'
import { createTransaction } from '@/lib/api'
import { cn, ENTITY_LABELS } from '@/lib/utils'
import type { TxType, Category, Subcategory } from '@/types'

interface AddTransactionDrawerProps {
  open: boolean
  onClose: () => void
  defaultEntityId?: string
}

const ENTITY_ICONS: Record<string, React.ElementType> = {
  HOUSEHOLD: House,
  RAFAEL_BIZ: Briefcase,
  LEAH_BIZ: Briefcase,
}

type Step = 1 | 2 | 3 | 4 | 5

export function AddTransactionDrawer({
  open,
  onClose,
  defaultEntityId,
}: AddTransactionDrawerProps) {
  const queryClient = useQueryClient()
  const { categories } = useCategories()
  const { entities } = useEntities()

  const [step, setStep] = useState<Step>(1)
  const [entityId, setEntityId] = useState(defaultEntityId ?? '')
  const [txType, setTxType] = useState<TxType>('EXPENSE')
  const [category, setCategory] = useState<Category | null>(null)
  const [subcategory, setSubcategory] = useState<Subcategory | null>(null)
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => {
    setStep(1)
    setEntityId(defaultEntityId ?? '')
    setTxType('EXPENSE')
    setCategory(null)
    setSubcategory(null)
    setAmount('')
    setDate(new Date().toISOString().split('T')[0])
    setNote('')
    setSaving(false)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const filteredCategories = categories.filter(
    (c) => c.type === txType || c.type === 'BOTH'
  )

  const handleSave = async () => {
    if (!entityId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('נא למלא סכום תקין')
      return
    }
    setSaving(true)
    try {
      await createTransaction({
        entityId,
        type: txType,
        amount: Number(amount),
        categoryId: category?.id ?? null,
        subcategoryId: subcategory?.id ?? null,
        date,
        note: note || null,
      })
      await queryClient.invalidateQueries({ queryKey: ['transactions'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('העסקה נוספה בהצלחה')
      handleClose()
    } catch {
      toast.error('שגיאה בשמירת העסקה')
    } finally {
      setSaving(false)
    }
  }

  const stepTitles: Record<Step, string> = {
    1: 'בחר ישות',
    2: 'סוג עסקה',
    3: 'קטגוריה',
    4: 'תת-קטגוריה',
    5: 'פרטי עסקה',
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="bottom"
        className="h-[90dvh] rounded-t-2xl px-4 pt-4 pb-0 flex flex-col"
        dir="rtl"
        showCloseButton={false}
      >
        {/* Header */}
        <SheetHeader className="flex-row items-center justify-between mb-4">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as Step)}
              className="p-2 -mr-2 text-gray-500 hover:text-gray-800"
              aria-label="חזור"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9" />
          )}
          <SheetTitle className="text-base font-semibold text-center flex-1">
            {stepTitles[step]}
          </SheetTitle>
          <div className="w-9" />
        </SheetHeader>

        {/* Step Indicator */}
        <div className="flex justify-center gap-1.5 mb-5">
          {([1, 2, 3, 4, 5] as Step[]).map((s) => (
            <div
              key={s}
              className={cn(
                'h-1.5 rounded-full transition-all',
                s === step ? 'w-6 bg-blue-600' : s < step ? 'w-3 bg-blue-300' : 'w-3 bg-gray-200'
              )}
            />
          ))}
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto">

          {/* Step 1: Choose Entity */}
          {step === 1 && (
            <div className="flex flex-col gap-3">
              {entities.map((entity) => {
                const Icon = ENTITY_ICONS[entity.type] ?? Briefcase
                return (
                  <button
                    key={entity.id}
                    onClick={() => {
                      setEntityId(entity.id)
                      setStep(2)
                    }}
                    className={cn(
                      'flex items-center gap-4 p-4 rounded-xl border-2 text-right transition-all active:scale-[0.98]',
                      entityId === entity.id
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-base font-semibold text-gray-800">
                      {ENTITY_LABELS[entity.type] ?? entity.name}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {/* Step 2: Choose Type */}
          {step === 2 && (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setTxType('INCOME')
                  setStep(3)
                }}
                className={cn(
                  'flex items-center gap-4 p-5 rounded-xl border-2 transition-all active:scale-[0.98]',
                  txType === 'INCOME'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white'
                )}
              >
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-700">הכנסה</p>
                  <p className="text-sm text-gray-500">כסף שנכנס</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setTxType('EXPENSE')
                  setStep(3)
                }}
                className={cn(
                  'flex items-center gap-4 p-5 rounded-xl border-2 transition-all active:scale-[0.98]',
                  txType === 'EXPENSE'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-white'
                )}
              >
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-700">הוצאה</p>
                  <p className="text-sm text-gray-500">כסף שיצא</p>
                </div>
              </button>
            </div>
          )}

          {/* Step 3: Choose Category */}
          {step === 3 && (
            <div className="flex flex-col gap-2">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat)
                    setSubcategory(null)
                    setStep(4)
                  }}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-xl border-2 text-right transition-all active:scale-[0.98]',
                    category?.id === cat.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-medium text-gray-800 flex-1">{cat.name}</span>
                  {category?.id === cat.id && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                </button>
              ))}
              <button
                onClick={() => {
                  setCategory(null)
                  setSubcategory(null)
                  setStep(5)
                }}
                className="p-3.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 text-sm text-right"
              >
                ללא קטגוריה
              </button>
            </div>
          )}

          {/* Step 4: Choose Subcategory */}
          {step === 4 && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setSubcategory(null)
                  setStep(5)
                }}
                className={cn(
                  'p-3.5 rounded-xl border-2 text-right text-sm font-medium transition-all',
                  !subcategory
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-600'
                )}
              >
                ללא תת-קטגוריה
              </button>
              {(category?.subcategories ?? []).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setSubcategory(sub)
                    setStep(5)
                  }}
                  className={cn(
                    'flex items-center justify-between p-3.5 rounded-xl border-2 text-right transition-all active:scale-[0.98]',
                    subcategory?.id === sub.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  )}
                >
                  <span className="text-sm font-medium text-gray-800">{sub.name}</span>
                  {subcategory?.id === sub.id && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Step 5: Amount + Date + Note */}
          {step === 5 && (
            <div className="flex flex-col gap-5 pb-8">
              {/* Summary */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-3">
                {category && (
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                )}
                <span className="text-sm text-gray-600">
                  {category?.name ?? 'ללא קטגוריה'}
                  {subcategory && ` › ${subcategory.name}`}
                </span>
                <span
                  className={cn(
                    'mr-auto text-xs font-medium px-2 py-0.5 rounded-full',
                    txType === 'INCOME'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {txType === 'INCOME' ? 'הכנסה' : 'הוצאה'}
                </span>
              </div>

              {/* Amount */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700">סכום (₪)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-2xl font-bold h-14 pr-4 pl-10 text-right"
                    autoFocus
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                    ₪
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4" />
                  תאריך
                </Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-11 text-right"
                />
              </div>

              {/* Note */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  הערה (אופציונלי)
                </Label>
                <Textarea
                  placeholder="הוסף הערה..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="resize-none text-right"
                  rows={3}
                />
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving || !amount}
                className="h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 w-full rounded-xl mt-2"
              >
                {saving ? 'שומר...' : 'שמור עסקה'}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
