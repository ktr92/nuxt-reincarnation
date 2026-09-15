// composables/useRouteCalculator.ts

// Описываем структуру ответа бэкенда
interface RouteData {
  path: string[];
  totalDistance: number;
}

interface CalculateResponse {
  status: 'success' | 'fail';
  data: RouteData | null;
  message?: string;
}

export const useRouteCalculator = () => {
  // Реактивные состояния для UI
  const calculatedRoute = ref<RouteData | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Метод отправки запроса на бэкенд для расчета пути
   */
  const calculatePath = async (startNodeId: string, endNodeId: string) => {
    // Сброс состояний перед новым расчетом
    isLoading.value = true;
    error.value = null;
    calculatedRoute.value = null;

    try {
      // Используем $fetch для императивного POST-запроса по событию
      const response = await $fetch<CalculateResponse>('/api/route/calculate', {
        method: 'POST',
        body: {
          startNodeId,
          endNodeId
        }
      });

      if (response.status === 'success' && response.data) {
        calculatedRoute.value = response.data;
      } else {
        // Обработка логического fail (например, изолированные ноды)
        error.value = response.message || 'Не удалось проложить маршрут.';
      }
    } catch (err: any) {
      // Обработка системных ошибок сервера (400, 500 и т.д.)
      error.value = err.data?.statusMessage || 'Произошла непредвиденная ошибка на сервере Space-ERP.';
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Метод для быстрой очистки результатов в интерфейсе
   */
  const clearRoute = () => {
    calculatedRoute.value = null;
    error.value = null;
  };

  return {
    calculatedRoute,
    isLoading,
    error,
    calculatePath,
    clearRoute
  };
};
