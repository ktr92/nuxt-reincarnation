<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Магазин (Nuxt 4 Data Fetching)</h1>

    <!-- Управление фильтрами -->
    <div class="flex gap-4 mb-4">
      <button @click="page++" class="px-4 py-2 bg-blue-500 text-white rounded">
        Следующая страница (Сейчас: {{ page }})
      </button>
      <button @click="category = 'books'" class="px-4 py-2 bg-gray-200 rounded">
        Выбрать книги
      </button>
    </div>

    <!-- Индикатор загрузки для основного запроса (актуально при реактивном перезапуске на клиенте) -->
    <div v-if="pending" class="text-yellow-600">Обновление данных...</div>

    <!-- Обработка ошибок -->
    <div v-if="error" class="text-red-500">
      Произошла ошибка: {{ error.message }}
    </div>

    <!-- Основной список товаров -->
    <ul v-else class="space-y-2 mb-8">
      <li v-for="product in products" :key="product.id" class="border p-2 rounded">
        <strong>{{ product.title }}</strong> — {{ product.price }} руб.
      </li>
    </ul>

    <!-- Блок ленивых данных -->
    <div class="bg-gray-100 p-4 rounded mb-8">
      <h3 class="font-semibold">Дополнительный статус системы (Lazy):</h3>
      <p v-if="lazyPending">Загрузка системных данных...</p>
      <pre v-else>{{ mixedData }}</pre>
    </div>

    <!-- Форма отправки данных -->
    <form @submit.prevent="handleCreateProduct" class="border-t pt-4">
      <h3 class="font-semibold mb-2">Добавить новый товар</h3>
      <input 
        v-model="newProductTitle" 
        type="text" 
        placeholder="Название товара" 
        class="border p-2 mr-2 rounded"
      />
      <button type="submit" class="px-4 py-2 bg-green-500 text-white rounded">
        Отправить (POST)
      </button>
    </form>
  </div>
</template>
<script setup lang="ts">
// Имитируем реактивные фильтры (например, для каталога товаров)
const page = ref(1)
const category = ref('electronics')

interface Product {
  id: number
  title: string
  price: number
  description: string // Это поле мы хотим отрезать для оптимизации трафика
}

/**
 * 1. ИСПОЛЬЗУЕМ useFetch ДЛЯ СЕРВЕРНОГО ПОЛУЧЕНИЯ ДАННЫХ
 * - URL передан как функция () => ... чтобы запрос автоматически перезапускался при изменении page или category
 * - transform: фильтрует данные на сервере, уменьшая размер JSON-payload, передаваемого клиенту
 * - watch: явно указывает, за какими реактивными переменными следить (хотя для URL-функций Nuxt делает это сам)
 */
const { 
  data: products, 
  pending, 
  error, 
  refresh 
} = await useFetch<Product[]>('/api/products', {
  // Передаем query-параметры. Nuxt автоматически развернет ref-переменные
  query: { page, cat: category },
  
  // Оптимизация payload: отдаем на клиент только id, title и price
  transform: (data) => {
    return data.map(p => ({ id: p.id, title: p.title, price: p.price }))
  },
  
  // Дополнительное кэширование: Nuxt не будет делать повторный запрос, 
  // если эти данные уже были загружены на сервере
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
})

/**
 * 2. ИСПОЛЬЗУЕМ useAsyncData ДЛЯ СЛОЖНЫХ СЦЕНАРИЕВ
 * Представим, что нам нужно склеить данные из двух разных источников.
 * lazy: true — компонент отрендерится сразу (не блокируя переход на страницу), данные подгрузятся в фоне
 */
const { data: mixedData, pending: lazyPending } = useAsyncData(
  'custom-composite-key', // Ключ обязателен, так как Nuxt не может сгенерировать его по URL
  async () => {
    // Используем $fetch внутри useAsyncData, так как мы находимся в серверном контексте composable
    const [info, status] = await Promise.all([
      $fetch('/api/additional-info'),
      $fetch('/api/system-status')
    ])
    return { info, status }
  },
  { lazy: true } 
)

/**
 * 3. ИСПОЛЬЗУЕМ $fetch ДЛЯ ДЕЙСТВИЙ ПОЛЬЗОВАТЕЛЯ (КЛИКИ / ФОРМЫ)
 * На клиенте $fetch работает как обычная обертка над fetch, но знает про base URL и контекст приложения.
 */
const newProductTitle = ref('')

const handleCreateProduct = async () => {
  if (!newProductTitle.value) return

  try {
    // Для мутаций (POST/PUT/DELETE) всегда используем чистый $fetch
    await $fetch('/api/products', {
      method: 'POST',
      body: { title: newProductTitle.value }
    })
    
    // Очищаем форму и принудительно обновляем наш основной списокuseFetch
    newProductTitle.value = ''
    await refresh() 
  } catch (err) {
    console.error('Ошибка при создании:', err)
  }
}
</script>


