'use client'

import { Link, usePathname, useRouter } from '@/i18n/navigation'

import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'

import { catalog, groups } from './catalog'

import styles from './index.module.scss'

export const Navigation = () => {
  const pathname = usePathname()
  const router = useRouter()
  const options = [
    { value: '/ui-kit', label: 'Overview' },
    ...catalog.map(entry => ({ value: `/ui-kit/${entry.group}/${entry.slug}`, label: `${entry.group} / ${entry.name}` })),
  ]

  return (
    <>
      <Box display={{ initial: 'block', tabS: 'none' }}>
        <Select
          ariaLabel="Component catalog"
          value={options.some(option => option.value === pathname) ? pathname : '/ui-kit'}
          options={options}
          onChange={path => router.push(path)}
        />
      </Box>
      <Grid
        as="nav"
        gap={4}
        display={{ initial: 'none', tabS: 'grid' }}
        className={styles.navigation}
        aria-label="Component catalog"
      >
        <Link
          href="/ui-kit"
          className={styles.link}
          aria-current={pathname === '/ui-kit' ? 'page' : undefined}
        >
          Overview
        </Link>
        {
          groups.map(group =>
            <Grid
              key={group}
              gap={2}
            >
              <Link
                href={`/ui-kit/${group}`}
                className={styles.link}
              >

                <Text
                  as="span"
                  weight={650}
                >
                  {group}
                </Text>
              </Link>
              {
                catalog.filter(entry => entry.group === group).map(entry =>
                  <Link
                    key={entry.slug}
                    href={`/ui-kit/${entry.group}/${entry.slug}`}
                    className={styles.link}
                    aria-current={pathname === `/ui-kit/${entry.group}/${entry.slug}` ? 'page' : undefined}
                  >
                    {entry.name}
                  </Link>
                )
              }
            </Grid>
          )
        }
      </Grid>
    </>
  )
}
