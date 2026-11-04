'use client'

import { useState } from 'react'

import { Confirm } from '@/components/Confirm'
import { Grid } from '@/components/Grid'
import { Text } from '@/components/Text'

export const ConfirmExample = () => {
  const [confirmed, setConfirmed] = useState(false)

  return (
    <Grid gap={3}>
      <Confirm
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
