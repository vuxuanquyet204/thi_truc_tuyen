import React from 'react'
import styles from './Card.module.css'

export type CardVariant = 'outlined' | 'elevated' | 'filled' | 'gradient'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  hoverable?: boolean
}

export default function Card({
  variant = 'outlined',
  hoverable = false,
  className = '',
  children,
  ...props
}: CardProps): JSX.Element {
  const classes = [
    styles.card,
    styles[variant],
    hoverable ? styles.hoverable : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}
