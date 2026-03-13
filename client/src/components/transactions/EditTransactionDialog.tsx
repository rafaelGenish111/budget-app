import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CalendarDays, FileText, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '@/hooks/useCategories'
import { updateTransaction, deleteTransaction } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { Transaction, TxType } from '@/types'

interface EditTransactionDialogProps {
  transaction: Transaction | null
  open: boolean
  onClose: () => void
}

export function EditTransactionDialog({
  transaction,
  open,
  onClose,
}: EditTransactionDialogProps) {
  const queryClient = useQueryClient()
  const { categories } = useCategories()

  const [txType, setTxType] = useState<TxType>('EXPENSE')
  const [categoryId, setCategoryId] = useState<string>('')
  const [subcategoryId, setSubcategoryId] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (transaction) {
      setTxType(transaction.type)
      setCategoryId(transaction.categoryId ?? '')
      setSubcategoryId(transaction.subcategoryId ?? '')
      setAmount(String(transaction.amount))
      setDate(transaction.date.split('T')[0])
      setNote(transaction.note ?? '')
      setConfirmDelete(false)
    }
  }, [transaction])

  const filteredCategories = categories.filter(
    (c) => c.type === txType || c.type === 'BOTH'
  )

  const selectedCategory = categories.find((c) => c.id === categoryId)
  const subcategories = selectedCategory?.subcategories ?? []

  const handleSave = async () => {
    if (!transaction) return
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('נא למלא סכום תקין')
      return
    }
    setSaving(true)
    try {
      await updateTransaction(transaction.id, {
        type: txType,
        amount: Number(amount),
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        date,
        note: note || null,
      })
      await queryClient.invalidateQueries({ queryKey: ['transactions'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('העסקה עודכנה')
      onClose()
    } catch {
      toast.error('שגיאה בעדכון העסקה')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!transaction) return
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setSaving(true)
    try {
      await deleteTransaction(transaction.id)
      await queryClient.invalidateQueries({ queryKey: ['transactions'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('העסקה נמחקה')
      onClose()
    } catch {
      toast.error('שגיאה במחיקת העסקה')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md mx-auto rounded-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right text-base font-semibold">
            עריכת עסקה
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Type toggle */}
          <div className="flex rounded-xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => { setTxType('INCOME'); setCategoryId(''); setSubcategoryId('') }}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium transition-colors',
                txType === 'INCOME'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600'
              )}
            >
              הכנסה
            </button>
            <button
              onClick={() => { setTxType('EXPENSE'); setCategoryId(''); setSubcategoryId('') }}
              className={cn(
                'flex-1 py-2.5 text-sm font-medium transition-colors',
                txType === 'EXPENSE'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600'
              )}
            >
              הוצאה
            </button>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">סכום (₪)</Label>
            <div className="relative">
              <Input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 text-xl font-bold pr-4 pl-10 text-right"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₪</span>
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-sm font-medium text-gray-700">קטגוריה</Label>
            <Select
              value={categoryId}
              onValueChange={(v) => { setCategoryId(v ?? ''); setSubcategoryId('') }}
            >
              <SelectTrigger className="h-11 text-right">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ללא קטגוריה</SelectItem>
                {filteredCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subcategory */}
          {subcategories.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium text-gray-700">תת-קטגוריה</Label>
              <Select value={subcategoryId} onValueChange={(v) => setSubcategoryId(v ?? '')}>
                <SelectTrigger className="h-11 text-right">
                  <SelectValue placeholder="בחר תת-קטגוריה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ללא תת-קטגוריה</SelectItem>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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
              הערה
            </Label>
            <Textarea
              placeholder="הוסף הערה..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none text-right"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="h-11 bg-blue-600 hover:bg-blue-700 w-full rounded-xl"
          >
            {saving ? 'שומר...' : 'שמור שינויים'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={saving}
            className={cn(
              'h-11 w-full rounded-xl gap-2',
              confirmDelete
                ? 'border-red-500 text-red-600 hover:bg-red-50'
                : 'text-gray-500'
            )}
          >
            <Trash2 className="w-4 h-4" />
            {confirmDelete ? 'לחץ שוב לאישור מחיקה' : 'מחק עסקה'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
