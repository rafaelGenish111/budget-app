import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Wallet } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
} from '@/lib/api'
import {
  formatCurrency,
  cn,
  ENTITY_LABELS,
  ACCOUNT_TYPE_LABELS,
} from '@/lib/utils'
import { useEntities } from '@/hooks/useEntities'
import type { Account, AccountType } from '@/types'

const ACCOUNT_TYPES: { value: AccountType; label: string }[] = [
  { value: 'CHECKING', label: 'עו"ש' },
  { value: 'SAVINGS', label: 'חסכון' },
  { value: 'DEPOSIT', label: 'פקדון' },
  { value: 'LOAN', label: 'הלוואה' },
]

const TYPE_COLORS: Record<AccountType, string> = {
  CHECKING: 'bg-blue-100 text-blue-700',
  SAVINGS: 'bg-green-100 text-green-700',
  DEPOSIT: 'bg-purple-100 text-purple-700',
  LOAN: 'bg-red-100 text-red-700',
}

interface AccountFormData {
  name: string
  type: AccountType
  balance: string
  entityId: string
  note: string
}

const DEFAULT_FORM: AccountFormData = {
  name: '',
  type: 'CHECKING',
  balance: '0',
  entityId: '',
  note: '',
}

export default function Accounts() {
  const queryClient = useQueryClient()
  const { entities } = useEntities()

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: getAccounts,
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<Account | null>(null)
  const [form, setForm] = useState<AccountFormData>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const openAdd = () => {
    setEditAccount(null)
    setForm({ ...DEFAULT_FORM, entityId: entities[0]?.id ?? '' })
    setDialogOpen(true)
  }

  const openEdit = (account: Account) => {
    setEditAccount(account)
    setForm({
      name: account.name,
      type: account.type,
      balance: String(account.balance),
      entityId: account.entityId,
      note: account.note ?? '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('נא להזין שם חשבון'); return }
    if (isNaN(Number(form.balance))) { toast.error('נא להזין יתרה תקינה'); return }
    setSaving(true)
    try {
      if (editAccount) {
        await updateAccount(editAccount.id, {
          name: form.name,
          type: form.type,
          balance: Number(form.balance),
          note: form.note || null,
        })
        toast.success('החשבון עודכן')
      } else {
        await createAccount({
          name: form.name,
          type: form.type,
          balance: Number(form.balance),
          entityId: form.entityId,
          note: form.note || null,
        })
        toast.success('החשבון נוסף')
      }
      await queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setDialogOpen(false)
    } catch {
      toast.error('שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirmDeleteId !== id) { setConfirmDeleteId(id); return }
    try {
      await deleteAccount(id)
      await queryClient.invalidateQueries({ queryKey: ['accounts'] })
      toast.success('החשבון נמחק')
      setConfirmDeleteId(null)
    } catch {
      toast.error('שגיאה במחיקה')
    }
  }

  // Group accounts by entity
  const grouped = entities.map((entity) => ({
    entity,
    accounts: accounts.filter((a) => a.entityId === entity.id),
  })).filter((g) => g.accounts.length > 0)

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  return (
    <div className="flex flex-col gap-5 py-4 pb-8" dir="rtl">
      {/* Total Balance */}
      <Card className="mx-4 p-4 bg-blue-600 border-0 text-white">
        <p className="text-sm text-blue-100 mb-1">סה"כ יתרות</p>
        <p className="text-2xl font-bold">{formatCurrency(totalBalance)}</p>
        <p className="text-xs text-blue-200 mt-1">{accounts.length} חשבונות</p>
      </Card>

      {/* Grouped accounts */}
      {isLoading ? (
        <div className="px-4 flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 px-4 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-gray-400" />
          </div>
          <p className="text-base font-medium text-gray-600">אין חשבונות עדיין</p>
          <p className="text-sm text-gray-400">הוסף חשבון בנק, חסכון או הלוואה</p>
        </div>
      ) : (
        grouped.map(({ entity, accounts: entityAccounts }) => (
          <div key={entity.id} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4">
              {ENTITY_LABELS[entity.type] ?? entity.name}
            </h3>
            <div className="px-4 flex flex-col gap-2">
              {entityAccounts.map((account) => (
                <Card key={account.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(account)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                        aria-label="ערוך"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          confirmDeleteId === account.id
                            ? 'bg-red-100 text-red-600'
                            : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'
                        )}
                        aria-label="מחק"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="flex items-center justify-end gap-2 mb-1">
                        <Badge
                          className={cn(
                            'text-xs px-2 py-0.5 border-0',
                            TYPE_COLORS[account.type]
                          )}
                        >
                          {ACCOUNT_TYPE_LABELS[account.type] ?? account.type}
                        </Badge>
                        <span className="text-sm font-semibold text-gray-800">
                          {account.name}
                        </span>
                      </div>
                      <p
                        className={cn(
                          'text-lg font-bold',
                          account.balance >= 0 ? 'text-gray-900' : 'text-red-600'
                        )}
                      >
                        {formatCurrency(account.balance)}
                      </p>
                      {account.note && (
                        <p className="text-xs text-gray-400 mt-0.5">{account.note}</p>
                      )}
                    </div>
                  </div>
                  {confirmDeleteId === account.id && (
                    <p className="text-xs text-red-600 text-right mt-2">
                      לחץ שוב לאישור מחיקה
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))
      )}

      {/* FAB Add Button */}
      <button
        onClick={openAdd}
        className="fixed bottom-20 left-4 w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 active:scale-95 transition-transform z-40"
        aria-label="הוסף חשבון"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
        <DialogContent className="max-w-md mx-auto rounded-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right">
              {editAccount ? 'עריכת חשבון' : 'הוספת חשבון'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">שם החשבון</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="לדוג׳: עו״ש בנק הפועלים"
                className="h-11 text-right"
              />
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">סוג חשבון</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as AccountType })}
              >
                <SelectTrigger className="h-11 text-right">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity (only for new accounts) */}
            {!editAccount && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-sm font-medium">ישות</Label>
                <Select
                  value={form.entityId}
                  onValueChange={(v) => setForm({ ...form, entityId: v ?? '' })}
                >
                  <SelectTrigger className="h-11 text-right">
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
            )}

            {/* Balance */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">יתרה (₪)</Label>
              <div className="relative">
                <Input
                  type="number"
                  inputMode="decimal"
                  value={form.balance}
                  onChange={(e) => setForm({ ...form, balance: e.target.value })}
                  className="h-11 text-right pl-8"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₪</span>
              </div>
            </div>

            {/* Note */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-sm font-medium">הערה (אופציונלי)</Label>
              <Input
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="הערה..."
                className="h-11 text-right"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-11 bg-blue-600 hover:bg-blue-700 w-full rounded-xl"
            >
              {saving ? 'שומר...' : editAccount ? 'שמור שינויים' : 'הוסף חשבון'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
