export const useDebouncedRef = <T>(value: T, X = 300): Ref<T> => {
 let timeout: ReturnType<typeof setTimeout> = 0;

 return customRef((track, trigger) => {
  let prevValue = value;

  return {
   get() {
    track();
    return prevValue
   },
   set(newValue) {
    
    if (timeout) clearTimeout(timeout); // при вводе счетчик сбрасывается заново

    timeout = setTimeout(() => {
     prevValue = newValue;
     trigger() // сообщаем что произошло изменение
    }, X)
   }
  }
 })

};


/*
ЕСЛИ На вход принимается РЕАКТИВНЫЙ Ref

export const useDebouncedRefFromSource = <T>(sourceRef: Ref<T>, delay = 300): Ref<T> => {
  // Создаем локальный Ref, инициализируя его текущим значением источника
  const debouncedRef = ref(sourceRef.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  // Следим за изменениями внешнего реактивного источника
  watch(sourceRef, (newValue) => {
    if (timeoutId) clearTimeout(timeoutId)

    timeoutId = setTimeout(() => {
      debouncedRef.value = newValue
    }, delay)
  })

  return debouncedRef
}

*/