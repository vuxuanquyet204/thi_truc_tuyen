import React from 'react'
import styles from './Skeleton.module.css'

export type SkeletonVariant = 'text' | 'circle' | 'rect'
export type SkeletonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface SkeletonProps {
	variant?: SkeletonVariant
	size?: SkeletonSize
	width?: string | number
	height?: string | number
	className?: string
	style?: React.CSSProperties
}

export interface SkeletonTableProps {
	rows?: number
	columns?: number
	className?: string
}

export interface SkeletonCardProps {
	showAvatar?: boolean
	lines?: number
	className?: string
}

export default function Skeleton({
	variant = 'text',
	size = 'md',
	width,
	height,
	className = '',
	style
}: SkeletonProps): JSX.Element {
	const classes = [
		styles.skeleton,
		styles[variant],
		size ? styles[size] : '',
		className,
	]
		.filter(Boolean)
		.join(' ')

	return (
		<div
			className={classes}
			style={{ width, height, ...style }}
			aria-hidden="true"
		/>
	)
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }): JSX.Element {
	return (
		<div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
			{Array.from({ length: lines }).map((_, i) => (
				<Skeleton
					key={i}
					variant="text"
					size={i === lines - 1 ? 'sm' : 'md'}
					width={i === lines - 1 ? '60%' : '100%'}
				/>
			))}
		</div>
	)
}

export function SkeletonTable({ rows = 5, columns = 4, className = '' }: SkeletonTableProps): JSX.Element {
	return (
		<table className={`${styles.table} ${className}`}>
			<tbody>
				{Array.from({ length: rows }).map((_, rowIndex) => (
					<tr key={rowIndex}>
						{Array.from({ length: columns }).map((_, colIndex) => (
							<td key={colIndex}>
								<Skeleton
									variant="text"
									size="sm"
									width={colIndex === 0 ? '80%' : '60%'}
								/>
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	)
}

export function SkeletonCard({ showAvatar = true, lines = 3, className = '' }: SkeletonCardProps): JSX.Element {
	return (
		<div className={`${styles.card} ${className}`}>
			{showAvatar && (
				<div className={styles.cardHeader}>
					<Skeleton variant="circle" width={40} height={40} />
					<div className={styles.cardLines}>
						<Skeleton variant="text" size="md" width="60%" />
						<Skeleton variant="text" size="sm" width="40%" />
					</div>
				</div>
			)}
			<SkeletonText lines={lines} />
		</div>
	)
}
