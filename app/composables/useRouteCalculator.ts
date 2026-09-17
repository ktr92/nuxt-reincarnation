// composables/useRouteCalculator.ts
import type { ApiResponse, ApiResponseError, RouteResult } from "~/types/space";
import { isApiResponseError } from "~/utils/api";

export const useRouteCalculator = () => {
  // Реактивные состояния для UI
  const calculatedRoute = ref<RouteResult | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isFromCache = ref(false);


  /**
   * Метод отправки запроса на бэкенд для расчета пути
   */
  const calculatePath = async (
    startNodeId: string,
    endNodeId: string,
    currentCriteria: "distance" | "cost",
  ) => {
    // Сброс состояний перед новым расчетом
    isLoading.value = true;
    error.value = null;
    calculatedRoute.value = null;
    isFromCache.value = false;

    try {
      // Запрос идет на роут Nitro. Передаем тип ответа ApiResponse<RouteResult>
      const response = await $fetch<ApiResponse<RouteResult>>(
        "/api/route/calculate",
        {
          method: "POST",
          body: {
            startNodeId,
            endNodeId,
            currentCriteria,
          },
        },
      );

      if (isApiResponseError(response)) {
        error.value = response.error || "Не удалось проложить маршрут.";
        return;
      }

      calculatedRoute.value = response.data;
      isFromCache.value = response.fromCache ?? false;

    } catch (err: any) {
      // Обработка системных ошибок сервера (400, 500 и т.д.)
      error.value =
        err.data?.statusMessage ||
        "Произошла непредвиденная ошибка на сервере Space-ERP.";
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
    isFromCache.value = false;
  };

  return {
    calculatedRoute,
    isLoading,
    error,
    calculatePath,
    clearRoute,
    isFromCache,
  };
};
