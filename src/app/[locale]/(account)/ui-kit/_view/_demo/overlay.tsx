'use client'

import { useState } from 'react'
import { toast } from 'react-toastify'

import { Action } from '@/components/Action'
import { Dropdown } from '@/components/Dropdown'
import { Grid } from '@/components/Grid'
import Icon from '@/components/Icon'
import { Text } from '@/components/Text'
import { Breadcrumbs } from '@/modules/Breadcrumbs'
import { Connection } from '@/modules/Connection'
import { Confirm } from '@/widgets/Modals/Confirm'

export const ConfirmExample = () => {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <Grid gap={3}>
      <Confirm
        variant="danger"
        label="Confirm"
        description="Confirm this demonstration action?"
        onConfirm={() => setConfirmed(true)}
      />
      <Confirm
        label="Disabled"
        description="Unavailable"
        disabled
        onConfirm={() => setConfirmed(true)}
      />
      {
        confirmed &&
        <Text
          color="success"
          role="status"
        >
          Confirmed
        </Text>
      }
    </Grid>
  )
}

export const BreadcrumbExample = () => (
  <Breadcrumbs
    items={[
    { label: 'Home', href: '/' },
    { label: 'My groups', href: '/dashboard' },
    { label: 'Family' },
    { label: 'Shopping' },
  ]}
  />
)

export const ToastExample = () => (
  <Grid gap={3}>
    <Action onClick={() => toast.success('Changes saved')}>Success notification</Action>
    <Action
      variant="danger"
      onClick={() => toast.error('Could not save. Try again.')}
    >
      Error notification
    </Action>
  </Grid>
)

export const DropdownExample = () => (
  <Grid gap={3}>
    <Dropdown label="Closed section"><Text>Section content</Text></Dropdown>
    <Dropdown
      label="Open section"
      open
    >
      <Text>Visible content</Text>
    </Dropdown>
    <Dropdown
      label="Plain section"
      plain
    >
      <Text>Nested content</Text>
    </Dropdown>
  </Grid>
)

export const ConnectionExample = () => (
  <Grid gap={3}>
    {
      (['connecting', 'live', 'offline'] as const).map(status =>
        <Connection
          key={status}
          status={status}
        />
      )
    }
  </Grid>
)

export const IconExample = () => (
  <Grid
    columns={4}
    gap={3}
  >
    <Icon
      name="shopping-basket"
      aria-label="Basket icon"
      role="img"
    />
    <Icon
      name="ArrowLeft"
      size={32}
      aria-label="Arrow icon"
      role="img"
    />
    <Icon
      name="google"
      size={24}
      aria-label="Google icon"
      role="img"
    />
    <Icon
      name="unknown-icon"
      aria-label="Fallback icon"
      role="img"
    />
  </Grid>
)
