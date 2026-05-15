import React from 'react'

interface CheckboxProps {
	id: string
	label: string
	checked: boolean
	onChange: (checked: boolean) => void
}

export default function Checkbox({ id, label, checked, onChange }: CheckboxProps): JSX.Element {
	return (
		<div style={{
			display: 'flex',
			alignItems: 'center',
			gap: '0.5rem'
		}}>
			<input
				type="checkbox"
				id={id}
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				style={{
					width: '1rem',
					height: '1rem',
					accentColor: 'var(--primary)'
				}}
			/>
			<label htmlFor={id} style={{
				fontSize: '0.875rem',
				color: 'var(--card-foreground)',
				cursor: 'pointer',
				margin: 0
			}}>
				{label}
			</label>
		</div>
	)
}
