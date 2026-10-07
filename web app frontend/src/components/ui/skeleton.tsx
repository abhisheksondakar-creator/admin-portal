import * as React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      role="presentation"
      className={cn('animate-pulse rounded bg-surface-2', className)}
      {...props}
    />
  )
}

export { Skeleton }
