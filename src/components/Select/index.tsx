'use client'

import type {
  ChangeEvent,
  KeyboardEvent,
  PointerEvent,
  SyntheticEvent,
} from 'react'
import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'
import clsx from 'clsx'

import { useDismiss } from '@/hooks/useDismiss'

import { Field } from '@/components/Field'
import Icon from '@/components/Icon'

import type { SelectPosition, SelectProps } from './types'

import styles from './index.module.scss'

export const Select = <Value extends string,>({
  id,
  name,
  label,
  hint,
  error,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = '—',
  ariaLabel,
  disabled,
  required,
  isLoading,
  className,
}: SelectProps<Value>) => {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const listId = `${fieldId}-list`
  const blockRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const nativeRef = useRef<HTMLSelectElement>(null)
  const searchRef = useRef({ value: '', timestamp: 0 })
  const [selected, setSelected] = useState<Value | ''>(defaultValue ?? '')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [invalid, setInvalid] = useState(false)
  const [position, setPosition] = useState<SelectPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: 280,
  })
  const currentValue = value ?? selected
  const current = options.find(option => option.value === currentValue)
  const currentIcon = current?.icon

  const handleClose = (restoreFocus = false) => {
    setOpen(false)

    if (restoreFocus) triggerRef.current?.focus()
  }

  useDismiss({ refs: [blockRef], enabled: open, onDismiss: reason => handleClose(reason === 'escape') })

  useEffect(() => {
    const form = nativeRef.current?.form
    const handleReset = () => {
      const resetValue = value ?? defaultValue ?? ''
      const select = nativeRef.current

      if (select) {
        for (const option of select.options) option.defaultSelected = option.value === resetValue
      }

      setSelected(defaultValue ?? '')
      setInvalid(false)
    }
    form?.addEventListener('reset', handleReset)

    return () => form?.removeEventListener('reset', handleReset)
  }, [defaultValue, value])

  useEffect(() => {
    if (!open) return

    const handleScroll = (event: Event) => {
      if (event.target instanceof Node && blockRef.current?.contains(event.target)) return

      setOpen(false)
    }
    const handleResize = () => setOpen(false)
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll, true)
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: 'nearest' })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [open, active, listId])

  const handleOpen = (edge?: 'first' | 'last') => {
    const trigger = triggerRef.current

    if (!trigger || trigger.matches(':disabled')) return

    const rect = trigger.getBoundingClientRect()
    const width = Math.min(Math.max(rect.width, 160), window.innerWidth - 16)
    const below = window.innerHeight - rect.bottom - 12
    const above = rect.top - 12
    const upwards = below < Math.min(240, options.length * 48 + 16) && above > below
    const height = Math.min(280, options.length * 48 + 16, Math.max(44, upwards ? above : below))
    const selectedIndex = options.findIndex(option => option.value === currentValue && !option.disabled)
    const enabled = options.map((option, index) => ({ ...option, index })).filter(option => !option.disabled)
    setPosition({
      top: upwards ? Math.max(8, rect.top - height - 6) : rect.bottom + 6,
      left: Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)),
      width,
      maxHeight: height,
    })
    setActive(
      edge === 'first' ? enabled[0]?.index ?? -1
        : edge === 'last' ? enabled.at(-1)?.index ?? -1
          : selectedIndex >= 0 ? selectedIndex : enabled[0]?.index ?? -1,
    )
    setOpen(true)
  }

  const handleSelect = (index: number) => {
    const option = options[index]

    if (disabled || isLoading || !option || option.disabled) return

    setSelected(option.value)
    setInvalid(false)
    onChange?.(option.value)
    handleClose(true)
  }

  const handleMove = (direction: number) => {
    const enabled = options.map((option, index) => ({ ...option, index })).filter(option => !option.disabled)
    const index = enabled.findIndex(option => option.index === active)
    setActive(enabled[(index + direction + enabled.length) % enabled.length]?.index ?? -1)
  }

  const handleChange = (event: ChangeEvent<HTMLSelectElement, HTMLSelectElement>) => {
    const index = options.findIndex(option => option.value === event.currentTarget.value)
    handleSelect(index)
  }

  const handleInvalid = (event: SyntheticEvent<HTMLSelectElement, Event>) => {
    event.preventDefault()
    setInvalid(true)
    triggerRef.current?.focus()
  }

  const handleClick = () => open ? handleClose() : handleOpen()

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Tab') {
      handleClose()

      return
    }

    if (event.key === 'Escape' && open) {
      event.preventDefault()
      event.stopPropagation()
      handleClose(true)

      return
    }

    if (['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()

      if (!open) handleOpen(event.key === 'Home' ? 'first' : event.key === 'ArrowUp' || event.key === 'End' ? 'last' : undefined)
      else if (event.key === 'Enter' || event.key === ' ') handleSelect(active)
      else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') handleMove(event.key === 'ArrowDown' ? 1 : -1)
      else {
        const enabled = options.map((option, index) => ({ ...option, index })).filter(option => !option.disabled)
        setActive((event.key === 'Home' ? enabled[0] : enabled.at(-1))?.index ?? -1)
      }

      return
    }

    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const now = Date.now()
      const query = now - searchRef.current.timestamp < 700 ? searchRef.current.value + event.key : event.key
      searchRef.current = { value: query, timestamp: now }
      const index = options.findIndex(option => !option.disabled && option.label.toLocaleLowerCase().startsWith(query.toLocaleLowerCase()))

      if (!open) handleOpen()
      if (index >= 0) setActive(index)
    }
  }

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => event.preventDefault()

  const handleMouseEnter = (index: number) => setActive(index)

  return (
    <Field
      id={fieldId}
      label={label}
      hint={hint}
      error={error}
      className={className}
    >
      <div
        ref={blockRef}
        className={styles.block}
      >
        <select
          ref={nativeRef}
          name={name}
          value={currentValue}
          required={required}
          disabled={disabled || isLoading}
          className={styles.native}
          tabIndex={-1}
          aria-hidden="true"
          onChange={handleChange}
          onInvalid={handleInvalid}
        >
          <option
            value=""
            disabled
          >
            {placeholder}
          </option>
          {
            options.map(option =>
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            )
          }
        </select>
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          role="combobox"
          aria-label={ariaLabel}
          className={
            clsx(
              styles.trigger,
              {
                [styles.invalid]: error || invalid
              }
            )
          }
          disabled={disabled || isLoading}
          aria-labelledby={label ? `${fieldId}-label ${fieldId}-value` : undefined}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
          aria-required={required}
          aria-invalid={Boolean(error || invalid)}
          aria-describedby={error || hint ? `${fieldId}-message` : undefined}
          aria-busy={isLoading || undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          {
            currentIcon &&
            <Icon
              name={currentIcon}
              className={styles.icon}
              size={18}
              aria-hidden="true"
            />
          }
          <span
            id={`${fieldId}-value`}
            className={styles.value}
          >
            {current?.shortLabel ?? current?.label ?? placeholder}
          </span>
          {
            isLoading
              ?
              <Icon
                name="loader-circle"
                className={styles.spinner}
                size={18}
                aria-hidden="true"
              />
              :
              <Icon
                name="chevron-down"
                className={
                  clsx(
                    styles.chevron,
                    {
                      [styles.open]: open
                    }
                  )
                }
                size={18}
                aria-hidden="true"
              />
          }
        </button>
        {
          open &&
          <div
            id={listId}
            role="listbox"
            aria-labelledby={fieldId}
            className={styles.list}
            style={position}
          >
            {
              options.map((option, index) => {
                const icon = option.icon

                return (
                  <button
                    key={option.value}
                    id={`${listId}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={option.value === currentValue}
                    disabled={disabled || isLoading || option.disabled}
                    tabIndex={-1}
                    className={
                      clsx(
                        styles.option,
                        {
                          [styles.active]: index === active
                        }
                      )
                    }
                    onPointerDown={handlePointerDown}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onClick={() => handleSelect(index)}
                  >
                    {
                      icon &&
                      <Icon
                        name={icon}
                        className={styles.icon}
                        size={18}
                        aria-hidden="true"
                      />
                    }
                    <span className={styles.value}>{option.label}</span>
                    {
                      option.value === currentValue &&
                      <Icon
                        name="check"
                        className={styles.icon}
                        size={18}
                        aria-hidden="true"
                      />
                    }
                  </button>
                )
              })
            }
          </div>
        }
      </div>
    </Field>
  )
}
