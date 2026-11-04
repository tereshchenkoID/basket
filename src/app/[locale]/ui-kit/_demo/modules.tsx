'use client'

import { useState } from 'react'

import { Action } from '@/components/Action'
import { Grid } from '@/components/Grid'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'
import { Avatar } from '@/modules/Avatar'
import { Empty } from '@/modules/Empty'
import { Loading } from '@/modules/Loading'
import { Mutation } from '@/modules/Mutation'
import { ThemeSwitcher } from '@/widgets/Header/Preferences/ThemeSwitcher'

export const Avatars = () =>
  <Grid
    columns={2}
    gap={3}
  >

    <Avatar
      name="Basket"
      url={null}
    />
    <Avatar
      name="Ihor Tereshchenko"
      url={null}
    />
  </Grid>

export const LoadingExample = () =>
  <Loading />

export const Themes = () =>
  <ThemeSwitcher initialTheme="system" />

export const ModuleForm = ({ kind }: { kind: 'GroupForm' | 'ListForm' | 'ItemForm' | 'QuickAdd' }) => {
  const [pending, setPending] = useState(false)
  const [saved, setSaved] = useState(false)
  const label = kind === 'GroupForm' ? 'Group name' : kind === 'ListForm' ? 'List title' : 'Add an item'

  return (
    <Grid gap={3}>
      <Text color="muted">Layout preview only: no database writes. The usage code below uses the real module and authenticated server actions.</Text>
      <Grid
        as="form"
        gap={3}
        p={3}
        surface="paper"
        border
        radius="large"
        onSubmit={event => { event.preventDefault(); setSaved(true) }}
      >
        <Grid
          columns={{ initial: 1, mobM: '1fr auto' }}
          align="end"
          gap={3}
        >
          <Input
            name="name"
            label={label}
            placeholder="Enter a name"
            required
            readOnly={pending}
          />
          <Action
            type="submit"
            isLoading={pending}
          >
            {kind === 'QuickAdd' ? 'Add' : 'Save'}
          </Action>
        </Grid>
        {
          kind === 'ItemForm' || kind === 'QuickAdd' &&
          <Grid
            columns={2}
            gap={3}
          >

            <Input
              label="Quantity"
              type="number"
              defaultValue="1"
            />
            <Select
              label="Unit"
              defaultValue="pcs"
              options={[{ value: 'pcs', label: 'pcs' }, { value: 'kg', label: 'kg' }]}
            />
          </Grid>
        }
      </Grid>
      <Action
        variant="secondary"
        onClick={() => setPending(!pending)}
      >
        Toggle loading
      </Action>
      {
        saved &&
        <Text
          role="status"
          color="success"
        >
          Demo submitted locally
        </Text>
      }
    </Grid>
  )
}

export const Mutations = () => (
  <Grid gap={3}>
    <Mutation
      label="Successful local action"
      operation={async () => ({ ok: true, data: null })}
    />
    <Mutation
      label="Error state"
      operation={async () => ({ ok: false, error: 'unavailable' })}
    />
    <Mutation
      label="Confirm local action"
      confirmation="Confirm this demo?"
      operation={async () => ({ ok: true, data: null })}
    />
  </Grid>
)

export const AuthExample = ({ kind }: { kind: 'GoogleLoginButton' | 'LogoutButton' | 'LanguageSwitcher' }) => (
  <Grid gap={3}>
    <Text color="muted">Use the application header for live locale changes. Authentication examples are disabled here to preserve your session.</Text>
    <Action disabled>{kind === 'GoogleLoginButton' ? 'Continue with Google' : kind === 'LogoutButton' ? 'Sign out' : 'English'}</Action>
  </Grid>
)

export const EmptyExamples = () => (
  <Grid gap={4}>
    <Empty />
    <Empty error="unavailable" />
    <Empty error="inviteInvalid" />
  </Grid>
)
