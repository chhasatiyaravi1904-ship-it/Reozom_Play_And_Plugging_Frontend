import type { FieldCondition } from '@/types/field'
import type { FieldValue } from '@/types/field'

export function useConditionalLogic(values: Record<string, FieldValue>) {
  function isVisible(condition?: FieldCondition): boolean {
    if (!condition) return true
    return String(values[condition.field] ?? '') === condition.equals
  }

  return { isVisible }
}
