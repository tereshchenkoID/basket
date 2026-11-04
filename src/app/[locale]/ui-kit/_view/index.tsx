'use client'

import { Link } from '@/i18n/navigation'

import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'

import { CATALOG, GROUPS } from '../catalog'

import styles from './index.module.scss'

const Section = () => (
  <Grid gap={4}>
    <Heading
      as="h1"
      size={6}
    >
      Components
    </Heading>
    <Text color="muted">Reusable components from src/components. Choose a component to explore its states, props and copyable code. Use the header to switch themes; use Tab to check keyboard focus.</Text>
    {
      GROUPS.map(group =>
        <Grid
          key={group}
          gap={2}
        >
          <Heading
            as="h2"
            size={5}
            transform="capitalize"
          >
            {group}
          </Heading>
          <Grid
            columns={{ initial: 1, tabS: 2 }}
            gap={2}
          >
            {
              CATALOG.filter(entry => entry.group === group).map(entry =>
                <Link
                  className={styles.card}
                  key={entry.slug}
                  href={`/ui-kit/${group}/${entry.slug}`}
                >
                  {entry.name}
                </Link>
              )
            }
          </Grid>
        </Grid>
      )
    }
  </Grid>
)

export default Section
