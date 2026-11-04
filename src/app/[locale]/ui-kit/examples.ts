import type { ComponentName } from './catalog'

export const examples: Record<ComponentName, string> = {
  Box: `
'use client'

import { Box } from '@/components/Box'
import { Text } from '@/components/Text'

export const Example = () => {
  return (
    <Box
      display="flex"
      align="center"
      justify="between"
      gap={3}
      p={4}
      surface="paper"
      border
      radius="large"
    >
      <Text>First</Text>
      <Text>Second</Text>
    </Box>
  )
}
`,
  Grid: `
'use client'

import { Grid } from '@/components/Grid'
import { Text } from '@/components/Text'

export const Example = () => {
  return (
    <Grid
      columns={{ initial: 1, mobM: 2, tabM: 3 }}
      gap={3}
    >
      <Text>One</Text>
      <Text>Two</Text>
      <Text>Three</Text>
    </Grid>
  )
}
`,
  Heading: `
'use client'

import { Heading } from '@/components/Heading'

export const Example = () => {
  return (
    <Heading
      as="h1"
      size="title"
      weight={650}
    >
      Shopping together
    </Heading>
  )
}
`,
  Text: `
'use client'

import { Text } from '@/components/Text'

export const Example = () => {
  return (
    <Text
      as="p"
      size="sm"
      color="muted"
    >
      Shared shopping lists
    </Text>
  )
}
`,
  Action: `
'use client'

import { Action } from '@/components/Action'

export const Example = () => {
  return (
    <>
      <Action variant="primary">Save</Action>
      <Action variant="secondary" disabled>Disabled</Action>
      <Action isLoading>Saving</Action>
      <Action href="/dashboard">Dashboard</Action>
    </>
  )
}
`,
  Input: `
'use client'

import { useState } from 'react'

import { Input } from '@/components/Input'

export const Example = () => {
  const [value, setValue] = useState('')

  return (
    <Input
      label="Name"
      name="name"
      value={value}
      onChange={event => setValue(event.currentTarget.value)}
      hint="Enter a name"
      required
    />
  )
}
`,
  Textarea: `
'use client'

import { useState } from 'react'

import { Textarea } from '@/components/Textarea'

export const Example = () => {
  const [value, setValue] = useState('')

  return (
    <Textarea
      label="Name"
      name="name"
      value={value}
      onChange={event => setValue(event.currentTarget.value)}
      hint="Enter a name"
      required
    />
  )
}
`,
  Field: `
'use client'

import { Field } from '@/components/Field'

export const Example = () => {
  return (
    <Field
      id="name"
      label="Name"
      hint="Enter a name"
    >
      <input id="name" name="name" aria-describedby="name-message" />
    </Field>
  )
}
`,
  Select: `
'use client'

import { useState } from 'react'

import { Select } from '@/components/Select'

export const Example = () => {
  const [value, setValue] = useState('pcs')

  return (
    <Select
      name="unit"
      label="Unit"
      value={value}
      onChange={setValue}
      options={[
        { value: 'pcs', label: 'Pieces' },
        { value: 'kg', label: 'Kilograms' },
        { value: 'l', label: 'Litres', disabled: true },
      ]}
      required
    />
  )
}
`,
  Checkbox: `
'use client'

import { useState } from 'react'

import { Checkbox } from '@/components/Checkbox'

export const Example = () => {
  const [checked, setChecked] = useState(false)

  return (
    <Checkbox
      label="Enabled"
      checked={checked}
      onChange={event => setChecked(event.currentTarget.checked)}
    />
  )
}
`,
  Toggle: `
'use client'

import { useState } from 'react'

import { Toggle } from '@/components/Toggle'

export const Example = () => {
  const [checked, setChecked] = useState(false)

  return (
    <Toggle
      label="Enabled"
      checked={checked}
      onChange={event => setChecked(event.currentTarget.checked)}
    />
  )
}
`,
  Confirm: `
'use client'

import { useState } from 'react'

import { Confirm } from '@/components/Confirm'
import { Text } from '@/components/Text'

export const Example = () => {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <>
      <Confirm
        label="Confirm"
        description="Continue?"
        onConfirm={() => setConfirmed(true)}
      />
      {confirmed && <Text role="status">Confirmed</Text>}
    </>
  )
}
`,
  Empty: `
import { Empty } from '@/modules/Empty'

export const Example = () => (
  <Empty
    title="No lists yet"
    description="Create a list to get started."
  />
)
`,
  Avatar: `
'use client'

import { Avatar } from '@/modules/Avatar'

export const Example = () => {
  return (
    <Avatar
      name="Ihor Tereshchenko"
      url={null}
    />
  )
}
`,
  Loading: `
'use client'

import { Loading } from '@/modules/Loading'

export const Example = () => {
  return (
    <Loading />
  )
}
`,
  ThemeSwitcher: `
'use client'

import { ThemeSwitcher } from '@/widgets/Header/Preferences/ThemeSwitcher'

export const Example = () => {
  return (
    <ThemeSwitcher initialTheme="system" />
  )
}
`,
  GroupForm: `
'use client'

import { GroupForm } from '@/modules/Groups/GroupForm'

import { useRouter } from '@/i18n/navigation'

export const Example = () => {
  const router = useRouter()

  return (
    <GroupForm
      locale="en"
      onSuccess={id => router.push('/groups/' + id)}
    />
  )
}
`,
  ListForm: `
'use client'

import { ListForm } from '@/modules/Shopping/ListForm'

import { useRouter } from '@/i18n/navigation'

export const Example = ({ groupId }: { groupId: string }) => {
  const router = useRouter()

  return (
    <ListForm
      groupId={groupId}
      onSuccess={id => router.push('/groups/' + groupId + '/lists/' + id)}
    />
  )
}
`,
  ItemForm: `
'use client'

import { ItemForm } from '@/app/[locale]/groups/[group-id]/lists/[list-id]/_view/ItemRow/ItemForm'

import type { ShoppingItem } from '@/types/database'

import { useRouter } from '@/i18n/navigation'

export const Example = ({ item }: { item: ShoppingItem }) => {
  const router = useRouter()

  return (
    <ItemForm
      item={item}
      onSuccess={() => router.refresh()}
    />
  )
}
`,
  QuickAdd: `
'use client'

import { QuickAdd } from '@/app/[locale]/groups/[group-id]/lists/[list-id]/_view/QuickAdd'

import { useRouter } from '@/i18n/navigation'

export const Example = ({ listId }: { listId: string }) => {
  const router = useRouter()

  return (
    <QuickAdd
      listId={listId}
      onSuccess={() => router.refresh()}
    />
  )
}
`,
  Mutation: `
'use client'

import { Mutation } from '@/modules/Mutation'

export const Example = () => {
  return (
    <Mutation
      label="Run operation"
      operation={async () => ({ ok: true, data: null })}
      onSuccess={() => console.log('Complete')}
    />
  )
}
`,
  GoogleLoginButton: `
'use client'

import { GoogleLoginButton } from '@/modules/Providers/Google'

export const Example = () => {
  return (
    <GoogleLoginButton
      locale="en"
      configured
      next="/en/dashboard"
    />
  )
}
`,
  LogoutButton: `
'use client'

import { LogoutButton } from '@/widgets/Header/Preferences/LogoutButton'

export const Example = () => {
  return (
    <LogoutButton locale="en" />
  )
}
`,
  LanguageSwitcher: `
'use client'

import { Suspense } from 'react'

import { LanguageSwitcher } from '@/widgets/Header/LanguageSwitcher'

export const Example = () => {
  return (
    <Suspense>
      <LanguageSwitcher />
    </Suspense>
  )
}
`,
}
