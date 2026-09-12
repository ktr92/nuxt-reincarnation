<template>
  <UApp> <!-- Обязательный корневой тег для Nuxt UI -->
    <div class="min-h-screen bg-gray-950 text-gray-100 font-sans antialiased">
      <!-- Верхняя Sci-Fi панель -->
      <header class="border-b border-gray-800 bg-gray-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div class="flex items-center gap-3">
          <UIcon name="i-heroicons-rocket-launch-solid" class="w-6 h-6 text-primary-500 animate-pulse" />
          <span class="font-black tracking-widest text-lg uppercase bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">
            Galaxy Logistics ERP
          </span>
        </div>
        <div class="text-xs font-mono text-gray-500">
          Сектор: SOLAR-01 // СИСТЕМА АКТИВНА
        </div>
      </header>

      <!-- Основной контент страницы -->
      <main>
        <slot />
      </main>
    </div>
  </UApp>
</template>
