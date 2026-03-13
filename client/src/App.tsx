import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { AddTransactionDrawer } from '@/components/transactions/AddTransactionDrawer'
import Dashboard from '@/pages/Dashboard'
import Transactions from '@/pages/Transactions'
import Reports from '@/pages/Reports'
import Accounts from '@/pages/Accounts'
import Settings from '@/pages/Settings'

export default function App() {
  const [addDrawerOpen, setAddDrawerOpen] = useState(false)

  return (
    <AppShell onAddClick={() => setAddDrawerOpen(true)}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>

      <AddTransactionDrawer
        open={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
      />
    </AppShell>
  )
}
