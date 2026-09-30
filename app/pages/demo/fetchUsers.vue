<template>
  <div>
    <ul>
      
      <li v-for="user of users" :id="user.id">
        <div>{{ user.name }}</div>
        <button @click="fetchUser(user.id)">Показать email</button>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { UseFetchOptions } from "#app";
const currentUser = ref<string>('')
const myFetch = <T,>(url: string, options?: UseFetchOptions<T>) => {
  const auth = useRequestHeader("authorization");

  return useFetch(() => url, {
    headers: useRequestHeaders(["authorization"]),
    transform: (values) => values.map(value => {
     return { id: value.id, name: value.name }
    }),
    ...options,
  });
};

const fetchUser = (id: string) => currentUser.value = id;
const { data:  } = await $fetch(`https://jsonplaceholder.typicode.com/users/`);

const {data: users} = await myFetch(`https://jsonplaceholder.typicode.com/users/`);
</script>
