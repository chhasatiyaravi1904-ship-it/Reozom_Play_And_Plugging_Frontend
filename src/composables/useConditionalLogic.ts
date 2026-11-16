import type { FieldValue } from '@/types/field'
import { conditionMatches, type Condition } from '@/utils/conditions'

export function useConditionalLogic(values: Record<string, FieldValue>) {
  function isVisible(condition?: Condition | null): boolean {
    return conditionMatches(condition, values)
  }

  return { isVisible }
}
