export type FieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'textarea'
  | 'yesno'
  | 'file'
  | 'signature'

export interface FieldOption {
  label: string
  value: string
}

export interface FieldCondition {
  field: string
  equals: string
}

export interface FieldDefinition {
  id: string
  fieldType?: FieldType
  type?: FieldType
  label: string
  helpText?: string
  placeholder?: string
  required?: boolean
  options?: FieldOption[]
  showIf?: FieldCondition
}

export type FieldValue = string | number | boolean | File | null
