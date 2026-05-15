import type { PropsWithChildren } from 'react'

type CardProps = PropsWithChildren<{
	className?: string
	style?: React.CSSProperties
}>

export default function Card({ className, style, children }: CardProps): JSX.Element {
	return (
		<section className={className} style={{ background: 'var(--card)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', padding: 24, ...style }}>
			{children}
		</section>
	)
}
