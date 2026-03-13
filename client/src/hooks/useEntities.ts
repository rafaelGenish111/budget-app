import { useQuery } from '@tanstack/react-query'
import { getEntities } from '@/lib/api'

export function useEntities() {
  const { data, isLoading } = useQuery({
    queryKey: ['entities'],
    queryFn: getEntities,
  })

  return {
    entities: data ?? [],
    isLoading,
  }
}
