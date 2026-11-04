import type { LucideProps } from 'lucide-react'

export interface IconProps extends Omit<LucideProps, 'ref'> {
  name?: string
}
