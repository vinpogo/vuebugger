import type { MaybeRefOrGetter } from 'vue'
import { computed, ref, toValue } from 'vue'

export function useWritableComputed<TValue, TSet = TValue>({
  get = (v) => v as unknown as TValue,
  set = (v) => v as unknown as TValue,
  initial = undefined,
}: {
  get?: (val: TValue) => TValue
  set?: (val: TSet) => TValue
  initial?: MaybeRefOrGetter<TValue>
} = {}) {
  const innerValue = ref(toValue(initial))

  return computed<TValue, TSet>({
    get: () => get(innerValue.value),
    set: (val) => (innerValue.value = set(val)),
  })
}
