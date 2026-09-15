<!-- components/route/RouteCalculator.vue -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'

// Описываем исходную структуру станции из вашей базы данных
interface SpaceNode {
  id: string;
  name: string; 
  coordinates?: { x: number; y: number; z: number };
  type?: string;
}

// Принимаем массив узлов от NetworkDashboard
const props = defineProps<{
  nodes: SpaceNode[]
}>()

// ПРЕОБРАЗОВАНИЕ (Маппинг): Добавляем обязательное для Nuxt UI v3 поле "label"
const formattedItems = computed(() => {
  return props.nodes.map(node => ({
    ...node,
    label: node.name // Задаем понятное имя для выпадающего списка
  }))
})

// Подключаем наш композабл
const { calculatedRoute, isLoading, error, calculatePath, clearRoute } = useRouteCalculator()

// Реактивные переменные теперь следят за отформатированными объектами
const startStation = ref<any>(null)
const endStation = ref<any>(null)

// Сброс результатов при изменении выбора
watch([startStation, endStation], () => {
  if (calculatedRoute.value || error.value) {
    clearRoute()
  }
})

// Отправка формы на сервер Nitro
const handleCalculate = async () => {
  if (!startStation.value || !endStation.value) return
  await calculatePath(startStation.value.id, endStation.value.id)
}
</script>

<template>
  <UCard class="w-full max-w-xl mx-auto shadow-lg border-gray-800 bg-gray-900/50 backdrop-blur-md">
    <template #header>
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-rocket-launch" class="w-5 h-5 text-primary" />
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          Калькулятор гиперпространственных маршрутов
        </h3>
      </div>
    </template>

    <!-- Форма расчета -->
    <form @submit.prevent="handleCalculate" class="space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <!-- Станция отправления -->
        <UFormField label="Станция отправления" required class="w-full">
          <USelectMenu
            v-model="startStation"
            :items="formattedItems"
            placeholder="Выберите точку старта..."
            searchable
            class="w-full"
          />
        </UFormField>

        <!-- Станция назначения -->
        <UFormField label="Станция назначения" required class="w-full">
          <USelectMenu
            v-model="endStation"
            :items="formattedItems"
            placeholder="Выберите пункт назначения..."
            searchable
            :disabled="!startStation"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Кнопка отправки запроса -->
      <UButton
        type="submit"
        block
        color="primary"
        icon="i-heroicons-cpu-chip"
        :loading="isLoading"
        :disabled="!startStation || !endStation || startStation.id === endStation.id"
      >
        Проложить кратчайший путь
      </UButton>
    </form>

    <!-- Результаты вычислений алгоритма Дейкстры -->
    <div class="mt-6 space-y-4">
      
      <UAlert
        v-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="soft"
        title="Маршрут заблокирован"
        :description="error"
      />

      <div 
        v-if="calculatedRoute" 
        class="p-4 bg-gray-900/30 border border-gray-800 rounded-lg space-y-3"
      >
        <div class="flex justify-between items-center border-b border-gray-800 pb-2">
          <span class="text-sm font-medium text-gray-400">Итоговая дистанция:</span>
          <span class="text-lg font-bold text-primary">
            {{ calculatedRoute.totalDistance }} св. лет
          </span>
        </div>

        <div>
          <span class="text-sm font-medium text-gray-400 block mb-2">Оптимальный маршрут:</span>
          
          <div class="flex flex-wrap items-center gap-2">
            <template v-for="(nodeId, index) in calculatedRoute.path" :key="nodeId">
              <UBadge color="neutral" variant="solid" class="font-mono">
                {{ props.nodes.find(n => n.id === nodeId)?.name || nodeId }}
              </UBadge>
              
              <UIcon 
                v-if="index < calculatedRoute.path.length - 1" 
                name="i-heroicons-arrow-right-16-solid" 
                class="w-4 h-4 text-gray-500" 
              />
            </template>
          </div>
        </div>
      </div>

    </div>
  </UCard>
</template>
