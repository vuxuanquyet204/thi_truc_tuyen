import React from 'react'
import { Search } from 'lucide-react'
import styles from './SearchBar.module.css'

interface SearchBarProps {
	value: string
	onChange: (value: string) => void
	placeholder?: string
	className?: string
}

export default function SearchBar({
	value,
	onChange,
	placeholder = 'Tìm kiếm...',
	className = ''
}: SearchBarProps): JSX.Element {

	return (
		<div className={`${styles.searchBar} ${className}`}>
			<Search className={styles.icon} size={18} />
			<input
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
			/>
		</div>
	)
}
