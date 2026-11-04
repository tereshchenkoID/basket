import type { ComponentName } from '../../catalog'

export type DemoProps = {
  name: ComponentName
}

export type FieldsProps = {
  kind: 'Input' | 'Textarea'
}

export type ChecksProps = {
  kind: 'Checkbox' | 'Toggle'
}
