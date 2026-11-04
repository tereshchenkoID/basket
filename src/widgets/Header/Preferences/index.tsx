'use client'

import {
  useEffect, useId, useRef, useState
} from 'react'
import { useTranslations } from 'next-intl'
import { LayoutDashboard, Menu, X } from 'lucide-react'

import { usePathname } from '@/i18n/navigation'

import { Action } from '@/components/Action'
import { Box } from '@/components/Box'
import { Grid } from '@/components/Grid'
import { Heading } from '@/components/Heading'
import { Text } from '@/components/Text'
import { Avatar } from '@/modules/Avatar'
import { LogoutButton } from '@/widgets/Header/Preferences/LogoutButton'
import { ThemeSwitcher } from '@/widgets/Header/Preferences/ThemeSwitcher'

import styles from './index.module.scss'

import type { PreferencesProps } from '@/types/components'

export const Preferences = ({ theme, account, locale }: PreferencesProps) => {
  const t = useTranslations('Common')
  const pathname = usePathname()
  const id = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    dialogRef.current?.close()
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const close = () => dialogRef.current?.close()

  return (
    <>
      <Action
        ref={triggerRef}
        variant="secondary"
        iconOnly
        className={styles.trigger}
        aria-label={t('menu')}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => {
          dialogRef.current?.showModal()
          setOpen(true)
        }}
      >
        <Menu
          size={20}
          aria-hidden="true"
        />
      </Action>
      <dialog
        ref={dialogRef}
        id={id}
        className={styles.panel}
        aria-labelledby={`${id}-title`}
        onClose={() => {
          setOpen(false)
          triggerRef.current?.focus()
        }}
        onPointerDown={event => {
          if (event.target !== event.currentTarget) return

          const rect = event.currentTarget.getBoundingClientRect()

          if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close()
        }}
      >
        <Box
          display="flex"
          justify="between"
          align="center"
          gap={3}
        >
          <Heading
            id={`${id}-title`}
            size="xl"
          >
            {t('menu')}
          </Heading>
          <Action
            variant="ghost"
            iconOnly
            aria-label={t('close')}
            onClick={close}
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </Action>
        </Box>
        {
          account &&
          <Grid
            gap={4}
            className={styles.account}
          >
            <Box
              display="flex"
              align="center"
              gap={3}
            >
              <Avatar
                name={account.name}
                url={account.avatar}
              />
              <Grid gap={1}>
                <Text weight={650}>{account.name}</Text>
                <Text
                  size="sm"
                  color="muted"
                >
                  {account.email}
                </Text>
              </Grid>
            </Box>
            <Action
              href="/dashboard"
              variant="secondary"
              onClick={close}
            >
              <LayoutDashboard
                size={18}
                aria-hidden="true"
              />
              {t('dashboard')}
            </Action>
          </Grid>
        }
        {
          !account &&
          <Action
            href="/login"
            variant="secondary"
            onClick={close}
          >
            {t('signIn')}
          </Action>
        }
        <Grid gap={3}>
          <Heading
            as="h3"
            size="lg"
          >
            {t('preferences')}
          </Heading>
          <ThemeSwitcher initialTheme={theme} />
        </Grid>
        {
          account &&
          <Box
            mt="auto"
            className={styles.logout}
          >
            <LogoutButton locale={locale} />
          </Box>
        }
      </dialog>
    </>
  )
}
