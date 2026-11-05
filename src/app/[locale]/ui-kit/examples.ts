import type { ComponentName } from './catalog'

export const EXAMPLES: Record<ComponentName, string> = {
  Tabs: `
'use client'

import { useState } from 'react'

import { Tabs } from '@/components/Tabs'
import { Text } from '@/components/Text'

const Example = () => {
  const [value, setValue] = useState('first')
  const handleChange = (value: string) => setValue(value)

  return (
    <Tabs
      label="Sections"
      value={value}
      onValueChange={handleChange}
      items={[
        { value: 'first', label: 'First', count: 3, content: <Text>First panel</Text> },
        { value: 'second', label: 'Second', count: 0, content: <Text>Second panel</Text> },
        { value: 'third', label: 'Disabled', disabled: true },
      ]}
    />
  )
}
`,
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

import { ROUTES_USER } from '@/constant/navigation'

import { Action } from '@/components/Action'

export const Example = () => {
  return (
    <>
      <Action variant="primary">Save</Action>
      <Action variant="secondary" disabled>Disabled</Action>
      <Action isLoading>Saving</Action>
      <Action href={ROUTES_USER.dashboard.url}>Dashboard</Action>
    </>
  )
}
`,
  Input: `
'use client'

import type { ChangeEvent } from 'react'
import { useState } from 'react'

import { Input } from '@/components/Input'

export const Example = () => {
  const [value, setValue] = useState('')
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setValue(event.currentTarget.value)

  return (
    <Input
      label="Name"
      name="name"
      value={value}
      onChange={handleChange}
      hint="Enter a name"
      required
    />
  )
}
`,
  Textarea: `
'use client'

import type { ChangeEvent } from 'react'
import { useState } from 'react'

import { Textarea } from '@/components/Textarea'

export const Example = () => {
  const [value, setValue] = useState('')
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => setValue(event.currentTarget.value)

  return (
    <Textarea
      label="Name"
      name="name"
      value={value}
      onChange={handleChange}
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
  const handleChange = (value: string) => setValue(value)

  return (
    <Select
      name="unit"
      label="Unit"
      value={value}
      onChange={handleChange}
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

import type { ChangeEvent } from 'react'
import { useState } from 'react'

import { Checkbox } from '@/components/Checkbox'

export const Example = () => {
  const [checked, setChecked] = useState(false)
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setChecked(event.currentTarget.checked)

  return (
    <Checkbox
      label="Enabled"
      checked={checked}
      onChange={handleChange}
    />
  )
}
`,
  Toggle: `
'use client'

import type { ChangeEvent } from 'react'
import { useState } from 'react'

import { Toggle } from '@/components/Toggle'

export const Example = () => {
  const [checked, setChecked] = useState(false)
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => setChecked(event.currentTarget.checked)

  return (
    <Toggle
      label="Enabled"
      checked={checked}
      onChange={handleChange}
    />
  )
}
`,
}
