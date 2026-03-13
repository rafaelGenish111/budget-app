import { Link } from 'react-router-dom'
import { ChevronLeft, Receipt } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TransactionItem } from '@/components/transactions/TransactionItem'
import { EditTransactionDialog } from '@/components/transactions/EditTransactionDialog'
import { useState } from 'react'
import type { Transaction } from '@/types'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const [editTx, setEditTx] = useState<Transaction | null>(null)

  if (transactions.length === 0) {
    return (
      <Card className="mx-4 p-6 flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Receipt className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500">אין עסקאות אחרונות</p>
      </Card>
    )
  }

  return (
    <>
      <Card className="mx-4 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {transactions.slice(0, 8).map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onEdit={setEditTx}
            />
          ))}
        </div>

        {/* Link to all transactions */}
        <Link
          to="/transactions"
          className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100 text-blue-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm font-medium">לכל העסקאות</span>
        </Link>
      </Card>

      <EditTransactionDialog
        transaction={editTx}
        open={editTx !== null}
        onClose={() => setEditTx(null)}
      />
    </>
  )
}
