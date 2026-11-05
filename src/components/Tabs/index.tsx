import type { KeyboardEvent } from 'react'
import { useId, useRef, useState } from 'react'
import clsx from 'clsx'

import { Text } from '@/components/Text'

import { nextTab } from './helpers'
import type { TabsProps } from './types'

import styles from './index.module.scss'

export const Tabs = ({
  items,
  value,
  defaultValue,
  onValueChange,
  label,
  disabled,
  children,
  className,
}: TabsProps) => {
  const id = useId()
  const [selected, setSelected] = useState(defaultValue)
  const buttonsRef = useRef(new Map<string, HTMLButtonElement>())
  const active = items.find(item => item.value === (value ?? selected) && !item.disabled)?.value
    ?? items.find(item => !item.disabled)?.value
  const handleSelect = (next: string) => {
    if (disabled) return
    if (value === undefined) setSelected(next)

    onValueChange?.(next)
  }

  const handleRef = (node: HTMLButtonElement | null, value: string) => {
    if (node) buttonsRef.current.set(value, node)
    else buttonsRef.current.delete(value)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, value: string) => {
    const next = nextTab(items, value, event.key)

    if (!next) return

    event.preventDefault()
    handleSelect(next)
    buttonsRef.current.get(next)?.focus()
  }

  return (
    <div
      className={
        clsx(
          styles.block,
          className
        )
      }
    >
      <div
        className={styles.list}
        role="tablist"
        aria-label={label}
      >
        {
          items.map(item =>
            <button
              ref={node => handleRef(node, item.value)}
              className={styles.tab}
              key={item.value}
              id={`${id}-tab-${encodeURIComponent(item.value)}`}
              role="tab"
              type="button"
              disabled={disabled || item.disabled}
              aria-selected={active === item.value}
              aria-controls={`${id}-panel-${encodeURIComponent(item.value)}`}
              tabIndex={!disabled && active === item.value ? 0 : -1}
              onClick={() => handleSelect(item.value)}
              onKeyDown={event => handleKeyDown(event, item.value)}
            >
              {item.label}
              {
                item.count !== undefined &&
                <Text
                  as="span"
                  size={2}
                >
                  {item.count}
                </Text>
              }
            </button>
          )
        }
      </div>
      {
        items.map(item =>
          <div
            className={styles.panel}
            id={`${id}-panel-${encodeURIComponent(item.value)}`}
            key={item.value}
            role="tabpanel"
            aria-labelledby={`${id}-tab-${encodeURIComponent(item.value)}`}
            hidden={active !== item.value}
            tabIndex={0}
          >
            {
              active === item.value &&
              (item.content ?? (typeof children === 'function' ? children(item.value) : children))
            }
          </div>
        )
      }
    </div>
  )
}
