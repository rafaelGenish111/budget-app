import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/lib/api'

export function useCategories() {
  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  return {
    categories: data ?? [],
    isLoading,
  }
}
