import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
	theme: Theme
	toggleTheme: () => void
	setTheme: (theme: Theme, isManual?: boolean) => void
	resetToSystemTheme: () => void
	isManualOverride: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
	children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [theme, setThemeState] = useState<Theme>(() => {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
	})

	const [isManualOverride, setIsManualOverride] = useState(false)

	const setTheme = (newTheme: Theme, isManual = true) => {
		setThemeState(newTheme)
		if (isManual) {
			localStorage.setItem('theme', newTheme)
			setIsManualOverride(true)
		} else {
			setIsManualOverride(false)
		}
	}

	const toggleTheme = () => {
		const newTheme = theme === 'light' ? 'dark' : 'light'
		setTheme(newTheme, true)
	}

	useEffect(() => {
		const root = document.documentElement
		root.classList.remove('light', 'dark')
		root.classList.add(theme)
		const metaThemeColor = document.querySelector('meta[name="theme-color"]')
		if (metaThemeColor) {
			metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#ffffff')
		}
	}, [theme])

	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const handleSystemThemeChange = (e: MediaQueryListEvent) => {
			const systemTheme = e.matches ? 'dark' : 'light'
			setThemeState(systemTheme)
		}
		const systemTheme = mediaQuery.matches ? 'dark' : 'light'
		setThemeState(systemTheme)
		mediaQuery.addEventListener('change', handleSystemThemeChange)
		return () => { mediaQuery.removeEventListener('change', handleSystemThemeChange) }
	}, [])

	const resetToSystemTheme = () => {
		const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
		localStorage.removeItem('theme')
		setIsManualOverride(false)
		setTheme(systemTheme, false)
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme, setTheme, resetToSystemTheme, isManualOverride }}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error('useTheme must be used within a ThemeProvider')
	}
	return context
}
