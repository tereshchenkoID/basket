'use client'

import { Link } from '@/i18n/navigation'

import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'

import type { CatalogGroupViewProps } from './types'

const Section = ({ group, entries }: CatalogGroupViewProps) => {
  return (
    <Grid gap={4}>
      <Heading as="h1">{group}</Heading>
      {
        entries.map(entry =>
          <Grid
            key={entry.slug}
            gap={2}
            surface="default"
            border
            radius="sm"
            p={3}
          >
            <Link href={`/ui-kit/${group}/${entry.slug}`}>{entry.name}</Link>
            <Text
              size={2}
              color="muted"
            >
              {entry.props}
            </Text>
          </Grid>
        )
      }
    </Grid>
  )
}

export default Section
