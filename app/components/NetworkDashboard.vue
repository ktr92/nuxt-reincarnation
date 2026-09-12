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
            Управление узлами транспортной сети Галактики
          </p>
        </div>
        <div class="flex gap-3">
          <UBadge color="primary" variant="subtle">Хабов: {{ nodes.length }}</UBadge>
        </div>
      </div>
    </UCard>

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
        color="red" 
        variant="soft" 
        icon="i-heroicons-trash" 
        @click="clearNetwork"
      >
        Сбросить карту
      </UButton>
    </div>

    <!-- Простой список сгенерированных планет для проверки -->
    <div v-if="nodes.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard 
        v-for="node in nodes" 
        :key="node.id" 
        class="border-gray-800 bg-gray-900/30"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-bold text-gray-200">{{ node.name }}</span>
            <UBadge size="sm" :color="node.type === 'hub' ? 'emerald' : 'orange'">
              {{ node.type }}
            </UBadge>
          </div>
        </template>
        <div class="text-xs text-gray-400 space-y-1">
          <div>ID: <span class="text-gray-300 font-mono">{{ node.id }}</span></div>
          <div>Координаты: 
            <span class="text-primary-400 font-mono">
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
import type { ApiResponse, SpaceEdge, SpaceNode } from '../types/space';
const { nodes, clearNetwork, setNetwork } = useSpaceNetwork();

// какую структуру данных мы ожидаем увидеть ВНУТРИ успешного ответа success
interface NetworkData {
  nodes: SpaceNode[];
  edges: SpaceEdge[];
}

// Nuxt автоматически типизирует ответ на основе того, что возвращает сервер
// но здесь TypeScript ЖЕСТКО знает, что networkResponse.value — это либо Успех с данными, либо Ошибка.
const { data: networkResponse, refresh } = await useFetch<ApiResponse<NetworkData>>('/api/network');

// Связываем полученные серверные данные с локальным shallowRef-хранилищем useSpaceNetwork
watch(() => networkResponse.value, (newVal) => {
  if (newVal && newVal.status === 'success') {
    setNetwork(newVal.data.nodes, newVal.data.edges)
  }
}, { immediate: true })

const generateSimulation = async () => {

  const newNodes: SpaceNode[] = [
    {
      id: 'earth-hub',
      name: 'Терра Центральный Хаб (Земля)',
      coordinates: { x: 0, y: 0, z: 0 },
      type: 'hub'
    },
    {
      id: 'mars-station',
      name: 'Аванпост Нью-Арес (Марс)',
      coordinates: { x: 140, y: 250, z: -50 },
      type: 'station'
    },
    {
      id: 'ceres-outpost',
      name: 'Добывающая станция Церера',
      coordinates: { x: 400, y: 600, z: 200 },
      type: 'outpost'
    }
  ];
  const newEdges: SpaceEdge[] = [
    {
      sourceId: 'earth-hub',
      targetId: 'mars-station',
      distance: 2.25, // в световых годах или условных единицах
      costPerLightYear: 150,
      status: 'active'
    },
    {
      sourceId: 'mars-station',
      targetId: 'ceres-outpost',
      distance: 4.80,
      costPerLightYear: 300,
      status: 'active'
    },
    {
      sourceId: 'earth-hub',
      targetId: 'ceres-outpost',
      distance: 6.50,
      costPerLightYear: 500,
      status: 'maintenance' // этот путь на техобслуживании
    }
  ];
  await $fetch('/api/network', { method: 'POST', body: { nodes: newNodes, edges: newEdges } });
  await refresh();
}
</script> 

<style scoped>

</style>