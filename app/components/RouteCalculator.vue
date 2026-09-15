<!-- components/route/RouteCalculator.vue -->
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { NodeId, SpaceNode } from "~/types/space";


/**
 * Описываем строгий UI-интерфейс, который явно совместим с Nuxt UI.
 * Мы копируем нужные поля из SpaceNode, но безопасно переименовываем конфликтный `type`.
 */
interface UISelectSpaceNode {
  readonly id: NodeId;
  readonly label: string;          // Требуется для отображения текста в Nuxt UI
  readonly stationType: 'hub' | 'station' | 'outpost'; // Переименовано, чтобы избежать конфликта
  readonly coordinates: {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  };
}

// Принимаем массив узлов от NetworkDashboard
const props = defineProps<{
  readonly nodes: readonly SpaceNode[];
}>();

// ПРЕОБРАЗОВАНИЕ (Маппинг): Добавляем обязательное для Nuxt UI v3 поле "label"
const formattedItems = computed<UISelectSpaceNode[]>(() => {
  return props.nodes.map((node) => ({
    id: node.id,
    label: node.name,
    stationType: node.type, // Безопасный перенос доменного типа
    coordinates: node.coordinates
  }));
});

// Подключаем наш композабл
const {
  calculatedRoute,
  isLoading,
  error,
  calculatePath,
  clearRoute,
  isFromCache,
} = useRouteCalculator();

// Реактивные переменные теперь следят за отформатированными объектами
const startStation = ref<UISelectSpaceNode | undefined>(undefined);
const endStation = ref<UISelectSpaceNode | undefined>(undefined);
const currentCriteria = ref<"distance" | "cost">("distance");

type OptimizationCriteria = "distance" | "cost";
const criteriaOptions: OptimizationCriteria[] = ["distance", "cost"];

// Сброс результатов при изменении выбора
watch([startStation, endStation, currentCriteria], () => {
  if (calculatedRoute.value || error.value) {
    clearRoute();
  }
});

// Отправка формы на сервер Nitro
const handleCalculate = async () => {
  if (!startStation.value || !endStation.value) return;

  // Компилятор теперь  уверен, что .id — это валидный NodeId, а не случайный string

  await calculatePath(
    startStation.value.id,
    endStation.value.id,
    currentCriteria.value,
  );
};
</script>

<template>
  <UCard
    class="w-full max-w-xl mx-auto shadow-lg border-gray-800 bg-gray-900/50 backdrop-blur-md"
  >
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

        <UFormField label="Стратегия оптимизации">
          <USelect
            v-model="currentCriteria"
            :items="criteriaOptions"
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
        :disabled="
          !startStation || !endStation || startStation.id === endStation.id
        "
      >
        Проложить кратчайший путь
      </UButton>
    </form>

    <!-- Результаты вычислений алгоритма Дейкстры -->
    <div class="mt-6 space-y-4">
      <UAlert
        v-if="error"
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="soft"
        title="Маршрут заблокирован"
        :description="error"
      />

      <div
        v-if="calculatedRoute"
        class="p-4 bg-gray-900/30 border border-gray-800 rounded-lg space-y-3"
      >
        <div
          class="flex justify-between items-center border-b border-gray-800 pb-2"
        >
          <div class="space-y-1">
            <span class="text-sm font-medium text-gray-400 block"
              >Результат оптимизации:</span
            >
            <!-- Красивый индикатор кэша уровня Senior -->
            <span
              v-if="isFromCache"
              class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full"
            >
              <UIcon
                name="i-heroicons-bolt-solid"
                class="w-3 h-3 animate-pulse"
              />
              Кэш Nitro (O(1) - 0ms)
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full"
            >
              <UIcon name="i-heroicons-cpu-chip" class="w-3 h-3" />
              Вычисление маршрута
            </span>
          </div>

          <span class="text-lg font-bold text-primary">
            {{ calculatedRoute.totalWeight }}
            {{ currentCriteria === "distance" ? "св. лет" : "кредитов" }}
          </span>
        </div>

        <div>
          <span class="text-sm font-medium text-gray-400 block mb-2"
            >Оптимальный маршрут:</span
          >

          <div class="flex flex-wrap items-center gap-2">
            <template
              v-for="(nodeId, index) in calculatedRoute.path"
              :key="nodeId"
            >
              <UBadge color="neutral" variant="solid" class="font-mono">
                {{ props.nodes.find((n) => n.id === nodeId)?.name || nodeId }}
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
