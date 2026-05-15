import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import styles from './Dropdown.module.css'

interface DropdownOption {
	value: string | boolean
	label: string
	disabled?: boolean
}

interface DropdownProps {
	options: DropdownOption[]
	value: string | boolean
	onChange: (value: string | boolean) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	style?: React.CSSProperties
	icon?: React.ReactNode
}

export default function Dropdown({
	options,
	value,
	onChange,
	placeholder = "Chọn...",
	disabled = false,
	className = '',
	style,
	icon
}: DropdownProps): JSX.Element {
	const [isOpen, setIsOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	const selectedOption = options.find(option => option.value === value)

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsOpen(false)
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleOptionClick = (optionValue: string | boolean) => {
		if (!disabled) {
			onChange(optionValue)
			setIsOpen(false)
		}
	}

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			setIsOpen(!isOpen)
		} else if (event.key === 'Escape') {
			setIsOpen(false)
		}
	}

	return (
		<div
			ref={dropdownRef}
			className={`${styles.dropdown} ${className}`}
			style={style}
		>
			<button
				type="button"
				className={`${styles.trigger} ${isOpen ? styles.open : ''} ${disabled ? styles.disabled : ''}`}
				onClick={() => !disabled && setIsOpen(!isOpen)}
				onKeyDown={handleKeyDown}
				disabled={disabled}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
			>
				{icon && <span className={styles.iconLeft}>{icon}</span>}
				<span className={styles.value}>
					{selectedOption ? selectedOption.label : placeholder}
				</span>
				<ChevronDown
					size={16}
					className={`${styles.icon} ${isOpen ? styles.rotated : ''}`}
				/>
			</button>

			{isOpen && (
				<div className={styles.menu}>
					<div className={styles.list} role="listbox">
						{options.map((option) => (
							<div
								key={String(option.value)}
								className={`${styles.option} ${option.value === value ? styles.selected : ''} ${option.disabled ? styles.disabled : ''}`}
								onClick={() => handleOptionClick(option.value)}
								role="option"
								aria-selected={option.value === value}
							>
								<span className={styles.optionLabel}>{option.label}</span>
								{option.value === value && (
									<Check size={16} className={styles.optionCheck} />
								)}
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	)
}