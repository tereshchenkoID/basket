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

export type ModuleFormProps = {
  kind: 'GroupForm' | 'ListForm' | 'Form' | 'Add'
}

export type AuthExampleProps = {
  kind: 'Google' | 'Logout' | 'Languages'
}
