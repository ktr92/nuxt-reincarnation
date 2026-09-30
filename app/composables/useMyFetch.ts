// composables/useMyFetch.ts
import type { UseFetchOptions } from '#app'

export function useMyFetch<T>(
  url: string | (() => string), 
  options: UseFetchOptions<T> = {}
) {
  const config = useRuntimeConfig()
  
  // 1. Забираем куки текущего пользователя для SSR
  const requestHeaders = useRequestHeaders(['cookie', 'authorization'])

  // 2. Вручную собираем итоговые заголовки (Объединяем дефолтные и кастомные)
  const mergedHeaders = {
    ...requestHeaders,
    ...((options.headers as Record<string, string>) || {})
  }

  // 3. Вручную собираем итоговый объект опций
  const finalOptions: UseFetchOptions<T> = {
    // Базовый URL из конфига Nuxt
    baseURL: config.public.apiBase || 'http://localhost:3000',
    
    // Передаем объединенные заголовки
    headers: mergedHeaders,

    // Глобальный перехватчик ошибок
    onResponseError({ response }) {
      if (response.status === 401) {
        clearNuxtData()
        navigateTo('/login')
      }
    },

    // Позволяем свойствам из options (например, query, watch, lazy) 
    // перезаписать или дополниться к остальным дефолтным параметрам
    ...options,
  }

  return useFetch(url, finalOptions)
}
