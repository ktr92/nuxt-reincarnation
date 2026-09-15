<!-- NetworkDashboard.vue (Полная интеграция с контрактами безопасных данных) -->
<template>
  <div class="p-6 max-w-5xl mx-auto space-y-6 bg-gray-950 min-h-screen text-gray-100">
    
    <!-- Карточка статуса -->
    <UCard class="border-gray-800 bg-gray-900/50 backdrop-blur-md">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-black text-primary-400 tracking-wider uppercase">
            Система Координат ERP
          </h2>
          <p class="text-gray-400 text-sm mt-1">
            Управление узлами транспортной сети Галактики [Strict Topology Mode]
          </p>
        </div>
        <div class="flex gap-3">
          <UBadge color="primary" variant="subtle">Хабов: {{ nodes.length }}</UBadge>
        </div>
      </div>
    </UCard>

    <!-- ИНТЕГРАЦИЯ: Калькулятор маршрутов со строгой типизацией -->
    <RouteCalculator v-if="nodes.length > 0" :nodes="nodes" />

    <!-- Кнопки действий -->
    <div class="flex gap-4">
      <UButton 
        color="primary" 
        icon="i-heroicons-play-solid" 
        @click="generateSimulation"
      >
        Инициализировать симуляцию секторов
      </UButton>
      
      <UButton 
        color="error" 
        variant="soft" 
        icon="i-heroicons-trash" 
        @click="handleClear"
      >
        Сбросить карту
      </UButton>
    </div>

    <!-- Список планет для проверки -->
    <div v-if="nodes.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard 
        v-for="node in nodes" 
        :key="node.id" 
        class="border-gray-800 bg-gray-900/30"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-bold text-gray-200">{{ node.name }}</span>
            <UBadge size="sm" :color="node.type === 'hub' ? 'success' : 'warning'">
              {{ node.type }}
            </UBadge>
          </div>
        </template>
        <div class="text-xs text-gray-400 space-y-1">
          <div>ID: <span class="text-primary-400 font-mono">{{ node.id }}</span></div>
          <div>Координаты: 
            <span class="text-gray-300 font-mono">
              [X: {{ node.coordinates.x }}, Y: {{ node.coordinates.y }}, Z: {{ node.coordinates.z }}]
            </span>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import type { ApiResponse, SpaceEdge, SpaceNode, PositiveNumber } from '../types/space';
import RouteCalculator from './RouteCalculator.vue'; 

// Используем глобальный стейт сети
const { nodes, clearNetwork, setNetwork } = useSpaceNetwork();

interface NetworkData {
  readonly nodes: SpaceNode[];
  readonly edges: SpaceEdge[];
}

// Загрузка текущей топологии графа с сервера с явным указанием дженерика ответа
const { data: networkResponse, refresh } = await useFetch<ApiResponse<NetworkData>>('/api/network');

// Синхронизация реактивного состояния с ответом API
watch(() => networkResponse.value, (newVal) => {
  if (newVal && newVal.status === 'success') {
    setNetwork(newVal.data.nodes, newVal.data.edges);
  }
}, { immediate: true });

/**
 * Очистка сети на фронтенде и уведомление сервера (при необходимости расширения логики)
 */
const handleClear = (): void => {
  clearNetwork();
};

/**
 * Генерация безопасной тестовой симуляции космической сети.
 * Все ID строго соответствуют шаблону `node_${string}`, а веса приводятся к PositiveNumber.
 */
const generateSimulation = async (): Promise<void> => {
  const newNodes: readonly SpaceNode[] = [
    { id: 'node_earth-hub', name: 'Терра Центральный Хаб (Земля)', coordinates: { x: 0, y: 0, z: 0 }, type: 'hub' },
    { id: 'node_mars-station', name: 'Аванпост Нью-Арес (Марс)', coordinates: { x: 140, y: 250, z: -50 }, type: 'station' },
    { id: 'node_ceres-outpost', name: 'Добывающая станция Церера', coordinates: { x: 400, y: 600, z: 200 }, type: 'outpost' }
  ];
  
  const newEdges: readonly SpaceEdge[] = [
    { 
      id: 'edge:node_earth-hub->node_mars-station', 
      sourceId: 'node_earth-hub', 
      targetId: 'node_mars-station', 
      distance: 2.25 as PositiveNumber, 
      costPerLightYear: 150 as PositiveNumber, 
      status: 'active' 
    },
    { 
      id: 'edge:node_mars-station->node_ceres-outpost', 
      sourceId: 'node_mars-station', 
      targetId: 'node_ceres-outpost', 
      distance: 4.80 as PositiveNumber, 
      costPerLightYear: 300 as PositiveNumber, 
      status: 'active' 
    },
    { 
      id: 'edge:node_earth-hub->node_ceres-outpost', 
      sourceId: 'node_earth-hub', 
      targetId: 'node_ceres-outpost', 
      distance: 6.50 as PositiveNumber, 
      costPerLightYear: 500 as PositiveNumber, 
      status: 'maintenance' 
    }
  ];
  
  // Отправляем строго валидированные данные на Nitro сервер
  await $fetch('/api/network', { 
    method: 'POST', 
    body: { nodes: newNodes, edges: newEdges } 
  });
  
  // Принудительно инвалидируем кэш useFetch и подтягиваем обновленный граф
  await refresh();
};
</script>
