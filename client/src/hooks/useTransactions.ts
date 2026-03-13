import { useQuery } from '@tanstack/react-query'
import { getTransactions } from '@/lib/api'

interface TransactionParams {
  entityId?: string
  categoryId?: string
  from?: string
  to?: string
  type?: string
  page?: number
  limit?: number
}

export function useTransactions(params?: TransactionParams) {
  const { data, isLoading } = useQuery({
    queryKey: ['transactions', params],
    queryFn: () => getTransactions(params),
  })

  return {
    transactions: data ?? [],
    isLoading,
  }
}
