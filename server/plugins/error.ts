// server/plugins/error.ts
import { DataIntegrityError } from "../utils/errors";
import type { ApiResponseError } from "~~/app/types/space";

export default defineNitroPlugin((nitroApp) => {
  // Перехватываем хук обработки ошибок Nitro
  nitroApp.hooks.hook("error", async (error, { event }) => {
    // Если запрос не к API (например, упал рендеринг страницы), игнорируем или логируем иначе
    if (!event || !event.path.startsWith('/api/')) return;

    let statusCode = 500;
    let errorMessage = "Internal Server Error: Квадрант сети недоступен.";

    // Проверяем, является ли ошибка нашим кастомным исключением валидации
    if (error instanceof DataIntegrityError) {
      statusCode = error.statusCode;
      errorMessage = error.message;
    } else if ('statusCode' in (error as any)) {
      // Перехват стандартных ошибок Nitro createError()
      statusCode = (error as any).statusCode;
      errorMessage = error.message;
    }

    // Устанавливаем HTTP статус ответа
    setResponseStatus(event, statusCode);
    
    // Формируем строгий корпоративный ответ в формате ApiResponseError
    const errorResponse: ApiResponseError = {
      status: "error",
      error: errorMessage,
      code: statusCode
    };

    // Отправляем JSON-ответ и закрываем соединение, предотвращая падение Nitro
    sendWebResponse(event, sendNoContent(event)); // Сброс стандартного вывода
    await defaultContentType(event, 'application/json');
    return appendResponseHeader(event, 'Content-Type', 'application/json'), send(event, JSON.stringify(errorResponse));
  });
});

