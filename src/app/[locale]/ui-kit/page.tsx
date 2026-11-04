import { Link } from '@/i18n/navigation'

import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'

import { catalog, groups } from './catalog'

const UIKit = () => (
  <Grid gap={4}>
    <Heading as="h1">Component catalog</Heading>
    <Text color="muted">Development only. Each component has its own examples, API and copyable code. Use the application theme and locale controls to check appearance. Hover and keyboard focus are interactive.</Text>
    {
      groups.map(group =>
        <Grid
          key={group}
          gap={2}
        >
          <Heading
            as="h2"
            size="xl"
          >
            {group}
          </Heading>
          {
            catalog.filter(entry => entry.group === group).map(entry =>
              <Link
                key={entry.slug}
                href={`/ui-kit/${group}/${entry.slug}`}
              >
                {entry.name}
              </Link>
            )
          }
        </Grid>
      )
    }
  </Grid>
)

export default UIKit
