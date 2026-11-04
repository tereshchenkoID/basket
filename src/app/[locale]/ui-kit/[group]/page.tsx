import { notFound } from 'next/navigation'

import { Link } from '@/i18n/navigation'

import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'

import { catalog } from '../catalog'

const Group = async ({ params }: { params: Promise<{ group: string }> }) => {
  const { group } = await params
  const entries = catalog.filter(entry => entry.group === group)

  if (!entries.length) notFound()

  return (
    <Grid gap={4}>
      <Heading as="h1">{group}</Heading>
      {
        entries.map(entry =>
          <Grid
            key={entry.slug}
            gap={2}
            surface="paper"
            border
            radius="small"
            p={3}
          >
            <Link href={`/ui-kit/${group}/${entry.slug}`}>{entry.name}</Link>
            <Text
              size="sm"
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

export default Group
