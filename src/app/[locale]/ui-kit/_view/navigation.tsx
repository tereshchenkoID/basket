'use client'

import { Link, usePathname, useRouter } from '@/i18n/navigation'

import { ROUTES_DEV } from '@/constant/navigation'

import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Select } from '@/components/Select'
import { Text } from '@/components/Text'

import { CATALOG, GROUPS } from '../catalog'

import styles from './index.module.scss'

export const Navigation = () => {
  const pathname = usePathname()
  const router = useRouter()
  const options = [
    { value: ROUTES_DEV.uiKit.url, label: ROUTES_DEV.uiKit.text },
    ...CATALOG.map(entry => ({ value: ROUTES_DEV.component.url(entry.group, entry.slug), label: `${entry.group} / ${entry.name}` })),
  ]

  const handleChange = (path: string) => router.push(path)

  return (
    <>
      <Box display={{ initial: 'block', tabS: 'none' }}>
        <Select
          ariaLabel="Component catalog"
          value={options.some(option => option.value === pathname) ? pathname : ROUTES_DEV.uiKit.url}
          options={options}
          onChange={handleChange}
        />
      </Box>
      <Grid
        as="nav"
        gap={3}
        display={{ initial: 'none', tabS: 'grid' }}
        className={styles.navigation}
        aria-label="Component catalog"
      >
        <Link
          href={ROUTES_DEV.uiKit.url}
          className={styles.link}
          aria-current={pathname === ROUTES_DEV.uiKit.url ? 'page' : undefined}
        >
          {ROUTES_DEV.uiKit.text}
        </Link>
        {
          GROUPS.map(group =>
            <Grid
              key={group}
              gap={1}
            >
              <Link
                href={ROUTES_DEV.group.url(group)}
                className={styles.link}
                aria-current={pathname === ROUTES_DEV.group.url(group) ? 'page' : undefined}
              >
                <Text
                  as="span"
                  weight="semibold"
                  size={2}
                  transform="capitalize"
                >
                  {group}
                </Text>
              </Link>
              {
                CATALOG.filter(entry => entry.group === group).map(entry =>
                  <Link
                    key={entry.slug}
                    href={ROUTES_DEV.component.url(entry.group, entry.slug)}
                    className={styles.link}
                    aria-current={pathname === ROUTES_DEV.component.url(entry.group, entry.slug) ? 'page' : undefined}
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
