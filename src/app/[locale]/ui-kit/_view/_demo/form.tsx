'use client'

import { useState } from 'react'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Checkbox } from '@/components/Checkbox'
import { Field } from '@/components/Field'
import { Grid } from '@/components/Grid'
import Icon from '@/components/Icon'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'
import { Textarea } from '@/components/Textarea'
import { Toggle } from '@/components/Toggle'

import type { ChecksProps, FieldsProps } from './types'

export const Actions = () => (
  <Grid gap={3}>
    {
      (['primary', 'secondary', 'ghost', 'danger'] as const).map(variant =>
        <Grid
          key={variant}
          columns={{ initial: 1, tabS: 3 }}
          gap={3}
        >
          <Action variant={variant}>{variant}</Action>
          <Action
            variant={variant}
            disabled
          >
            Disabled
          </Action>
          <Action
            variant={variant}
            isLoading
          >
            Loading
          </Action>
        </Grid>
      )
    }
    <Box
      display="flex"
      wrap="wrap"
      align="center"
      gap={3}
    >
      <Action
        iconOnly
        aria-label="Add"
      >
        <Icon
          name="plus"
          size={18}
          aria-hidden="true"
        />
      </Action>
      <Action
        iconOnly
        isLoading
        aria-label="Loading icon button"
      >
        <Icon
          name="plus"
          size={18}
          aria-hidden="true"
        />
      </Action>
      <Action href="/">Link</Action>
      <Action
        href="/"
        aria-disabled="true"
      >
        Disabled link
      </Action>
      <Action
        href="/"
        isLoading
      >
        Loading link
      </Action>
    </Box>
  </Grid>
)

const FIELD_STATES = [
  { label: 'Default', placeholder: 'Enter a value' },
  { label: 'Hint', placeholder: 'Enter a value', hint: 'Helpful description' },
  { label: 'Error', error: 'Check this value', defaultValue: 'Invalid value' },
  { label: 'Disabled', disabled: true, defaultValue: 'Unavailable' },
  { label: 'Read only', readOnly: true, defaultValue: 'Read only' },
  { label: 'Loading', isLoading: true, defaultValue: 'Loading' },
  { label: 'Required', required: true, placeholder: 'Required value' },
]

export const Fields = ({ kind }: FieldsProps) => {
  const Component = kind === 'Input' ? Input : Textarea

  return (
    <Grid
      gap={3}
      align="start"
      columns={{ initial: 1, tabS: 2 }}
    >
      {
        FIELD_STATES.map(state =>
          <Box
            key={state.label}
            p={3}
            border
            radius="sm"
            surface="default"
          >
            <Component {...state} />
          </Box>
        )
      }
    </Grid>
  )
}

export const Selects = () => {
  const [value, setValue] = useState('second')
  const [submitted, setSubmitted] = useState(false)
  const options = [
    { value: 'first', label: 'First option' },
    { value: 'second', label: 'Second option' },
    { value: 'disabled', label: 'Disabled option', disabled: true },
  ]

  return (
    <Grid
      gap={3}
      align="start"
      columns={{ initial: 1, tabS: 2 }}
    >
      <Select
        label="Default"
        options={options}
        placeholder="Choose an option"
      />
      <Select
        label="Controlled"
        value={value}
        onChange={setValue}
        options={options}
      />
      <Select
        label="Error"
        error="Choose a value"
        options={options}
      />
      <Select
        label="Hint"
        hint="Use arrows, Enter, Escape or type to search"
        options={options}
      />
      <Select
        label="Disabled"
        defaultValue="second"
        disabled
        options={options}
      />
      <Select
        label="Loading"
        isLoading
        options={options}
      />
      <Select
        label="Empty"
        options={[]}
        placeholder="No options"
      />
      <Grid
        as="form"
        gap={3}
        onSubmit={event => { event.preventDefault(); setSubmitted(true) }}
        onReset={() => setSubmitted(false)}
      >
        <Select
          name="choice"
          label="Required, with reset"
          defaultValue="second"
          required
          options={options}
        />
        <Grid
          columns={2}
          gap={2}
        >
          <Action type="submit">Validate</Action>
          <Action
            type="reset"
            variant="secondary"
          >
            Reset
          </Action>
        </Grid>
        {
          submitted &&
          <Text
            color="success"
            role="status"
          >
            Valid selection
          </Text>
        }
      </Grid>
    </Grid>
  )
}

export const Checks = ({ kind }: ChecksProps) => {
  const Component = kind === 'Checkbox' ? Checkbox : Toggle
  const [checked, setChecked] = useState(false)

  return (
    <Grid
      gap={3}
      align="start"
      columns={{ initial: 1, tabS: 2 }}
    >
      <Component
        label="Controlled"
        checked={checked}
        onChange={event => setChecked(event.currentTarget.checked)}
      />
      <Component label="Unchecked" />
      <Component
        label="Checked"
        defaultChecked
      />
      <Component
        label="Disabled"
        disabled
      />
      <Component
        label="Checked and disabled"
        defaultChecked
        disabled
      />
      <Component
        label="Error"
        error="Check this value"
      />
    </Grid>
  )
}

export const FieldExample = () => (
  <Field
    id="custom-field"
    label="Custom field"
    hint="Label and description are connected to the control"
  >
    <Input
      id="custom-field"
      aria-describedby="custom-field-message"
      placeholder="Custom control"
    />
  </Field>
)
