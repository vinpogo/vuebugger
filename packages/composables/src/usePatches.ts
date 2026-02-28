import { create, type Draft } from 'mutative'
import {
  readonly,
  ref,
  toValue,
  watchEffect,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

type Patch<T> = (data: Draft<T>) => void

export const usePatches = <
  TState extends Record<string | number | symbol, any>,
>(
  initialData: MaybeRefOrGetter<TState>,
) => {
  const data = ref(toValue(initialData)) as Ref<TState>

  const patches = ref<Patch<TState>[]>([]) as Ref<
    Patch<TState>[]
  >
  const patch = (patch: Patch<TState>) =>
    patches.value.push(patch)
  const removePatch = (patch: Patch<TState>) =>
    (patches.value = patches.value.filter(
      (p) => p !== patch,
    ))
  const reset = () => (patches.value = [])

  const flush = () => {
    let d = data.value
    patches.value.forEach((patch) => {
      const patchedData = create<TState>(d, (draft) => {
        patch(draft)
      })
      if (patchedData === d) {
        removePatch(patch)
      }
      d = patchedData
    })

    data.value = d
  }

  watchEffect(() => {
    flush()
  })

  return {
    data,
    patches: readonly(patches),
    patch,
    removePatch,
    reset,
  }
}
