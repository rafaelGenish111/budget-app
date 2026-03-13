import { useQuery } from '@tanstack/react-query'
import { getDashboard } from '@/lib/api'

interface DashboardParams {
  month: number
  year: number
}

export function useDashboard(params: DashboardParams) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', params.month, params.year],
    queryFn: () => getDashboard(params),
  })

  return {
    data,
    isLoading,
  }
}
