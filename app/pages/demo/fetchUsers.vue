<template>
  <div>
    <ul>
      
      <li v-for="user of users" :id="user.id">
        <div>{{ user.name }}</div>
        <div v-if="currentUser === user.id">
          <div></div>
          {{ currentUserEmail.email }}
        </div>
        <button @click="fetchUser(user.id)">Показать email</button>
        <br>
        <br>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { UseFetchOptions } from "#app";
const currentUser = ref<string>('')
const currentUserEmail = ref<string>('')
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

const fetchUser = async (id: string) => {
  currentUser.value = id;
  try {
    currentUserEmail.value = await myFetch(`https://jsonplaceholder.typicode.com/users/${currentUser.value}`, {
      
    });
  } catch (error) {
    console.error(error)
  }
 
}


const {data: users} = await myFetch(`https://jsonplaceholder.typicode.com/users/`);
</script>
