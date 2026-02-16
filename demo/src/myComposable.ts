import { debug } from '@vingy/vuebugger'
import { computed, reactive, ref } from 'vue'

export function useFoo() {
  const priv = ref(0)

  const squared = computed(() => priv.value * priv.value)

  const foo = reactive({
    vin: 'was here',
    one: 1,
    bool: false,
    nested: { vin: 'still here' },
  })

  const inc = () => priv.value++
  const dec = () => priv.value--

  debug('useFoo', { value: priv, squared, foo })

  return { inc, dec }
}
