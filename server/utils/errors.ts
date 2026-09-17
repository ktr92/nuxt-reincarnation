// server/utils/errors.ts

/**
 * Кастомное исключение для нарушений целостности данных.
 * Используется внутри assertion-функций.
 */
export class DataIntegrityError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number = 422) {
    super(message);
    this.name = 'DataIntegrityError';
    this.statusCode = statusCode;
    
    // Корректная настройка прототипа для работы instanceof в TS
    Object.setPrototypeOf(this, DataIntegrityError.prototype);
  }
}

export class GraphAnomalyError extends Error {
  
}

export function logGraphAnomaly(message: string, details?: any) {
  const timestamp = new Date().toISOString()
  console.warn(`[ANOMALY DETECTED] [${timestamp}] 🛰️: ${message}`, details || '')
}