// app/utils/api.ts
import type { ApiResponse, ApiResponseError } from "~/types/space";

/**
 * Глобальный декларативный Type Predicate для сужения типов ответов Space-ERP API.
 * Инкапсулирует структуру дискриминантного объединения.
 */
export function isApiResponseError<T>(res: ApiResponse<T>): res is ApiResponseError {
  return res.status === 'error';
}