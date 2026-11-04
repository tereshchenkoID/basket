import type { ComponentName } from './catalog'

export const EXAMPLES: Record<ComponentName, string> = {
  Container: `
import { Container } from '@/components/Container'
import { Text } from '@/components/Text'

const Example = () => (
  <Container as="section" py={4}>
    <Text>Page content</Text>
  </Container>
)
`,
  Dropdown: `
import { Dropdown } from '@/components/Dropdown'
import { Text } from '@/components/Text'

const Example = () => (
  <Dropdown label="List settings">
    <Text>Section content</Text>
  </Dropdown>
)
`,
  Connection: `
import { Connection } from '@/modules/Connection'

const Example = () => <Connection status="live" />
`,
  Icon: `
import Icon from '@/components/Icon'

const Example = () => (
  <Icon name="shopping-basket" size={24} aria-hidden="true" />
)
`,
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
      surface="default"
      border
      radius="lg"
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
      size={6}
      weight="semibold"
      transform="uppercase"
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
      size={2}
      color="muted"
      weight="regular"
      transform="none"
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
  Breadcrumbs: `
import { Breadcrumbs } from '@/modules/Breadcrumbs'

export const Example = () => (
  <Breadcrumbs
    items={[
      { label: 'Home', href: '/' },
      { label: 'My groups', href: '/dashboard' },
      { label: 'Shopping' },
    ]}
  />
)
`,
  Toastify: `
'use client'

import { toast } from 'react-toastify'

import { Action } from '@/components/Action'

// The shared Toastify container is already mounted in the locale layout.
const Example = () => (
  <Action onClick={() => toast.success('Changes saved')}>
    Show notification
  </Action>
)
`,
  Confirm: `
'use client'

import { useState } from 'react'

import { Confirm } from '@/widgets/Modals/Confirm'
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
  Theme: `
'use client'

import { Theme } from '@/widgets/Modals/Preferences/Theme'

export const Example = () => {
  return (
    <Theme initialTheme="system" />
  )
}
`,
  GroupForm: `
'use client'

import { GroupForm } from '@/modules/GroupForm'

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

import { ListForm } from '@/modules/ListForm'

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
  Form: `
'use client'

import { Form } from '@/app/[locale]/(account)/groups/[group-id]/lists/[list-id]/_view/Item/Form'

import type { ShoppingItem } from '@/types/database'

import { useRouter } from '@/i18n/navigation'

export const Example = ({ item }: { item: ShoppingItem }) => {
  const router = useRouter()

  return (
    <Form
      item={item}
      onSuccess={() => router.refresh()}
    />
  )
}
`,
  Add: `
'use client'

import { Add } from '@/app/[locale]/(account)/groups/[group-id]/lists/[list-id]/_view/Add'

import { useRouter } from '@/i18n/navigation'

export const Example = ({ listId }: { listId: string }) => {
  const router = useRouter()

  return (
    <Add
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
  Google: `
'use client'

import { Google } from '@/modules/Providers/Google'

export const Example = () => {
  return (
    <Google
      locale="en"
      configured
      next="/en/dashboard"
    />
  )
}
`,
  Logout: `
'use client'

import { Logout } from '@/widgets/Modals/Preferences/Logout'

export const Example = () => {
  return (
    <Logout locale="en" />
  )
}
`,
  Languages: `
'use client'

import { Suspense } from 'react'

import { Languages } from '@/widgets/Header/Languages'

export const Example = () => {
  return (
    <Suspense>
      <Languages />
    </Suspense>
  )
}
`,
}
