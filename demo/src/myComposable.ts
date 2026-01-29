import { ref } from 'vue'
import { debug } from '../../src'

export function useFoo() {
  const priv = ref(0)

  const inc = () => priv.value++
  const dec = () => priv.value--

  debug('useFoo', { priv })

  return { inc, dec }
}
