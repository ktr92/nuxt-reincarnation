<template>
  <div>
    <ul>
      <li v-for="user of users" :id="user.id">
        <div>{{ user.name }}</div>
        <div v-if="currentUser === user.id">
          <div v-if="loading">Загрузка...</div>
          <div v-else>{{ currentUserEmail }}</div>
        </div>
        <button @click="fetchUser(user.id)">Показать email</button>
        <br />
        <br />
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { UseFetchOptions } from "#app";
const currentUser = ref<number>(0);
const currentUserEmail = ref<string>("");
const loading = ref<boolean>(false);

type User = Record<"id", number> & Record<"name", string>;

const myFetch = <T,>(url: string, options?: UseFetchOptions<T>) => {
  return useFetch(() => url, {
    headers: {
      Authorization: "Bearer MY_SECRET_TOKEN",
    },
    ...options,
  });
};

const fetchUser = async (id: number) => {
  currentUser.value = id;
  loading.value = true;
  currentUserEmail.value = "";
  try {
    const data = await $fetch<Record<"email", string>>(
      `https://jsonplaceholder.typicode.com/users/${id}`,
      {
        headers: { Authorization: "Bearer MY_SECRET_TOKEN" },
        // Нативное решение: отключаем кэш браузера для этого запроса
        // Больше никаких 304 ответов, только 200 OK
        cache: "no-store",
      },
    );
    currentUserEmail.value = data.email;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const { data: users } = await myFetch<User[]>(
  `https://jsonplaceholder.typicode.com/users/`,
  {
    transform: (values) =>
      values.map((value) => {
        return { id: value.id, name: value.name };
      }),
  },
);
</script>
