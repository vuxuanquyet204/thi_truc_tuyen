import { useState, useCallback, useEffect } from 'react'
import { ValidationResult } from '@/features/auth/utils/authValidation'

interface FormField {
	value: string
	error: string | null
	isValid: boolean
	suggestions: string[]
	touched: boolean
}

interface UseFormValidationOptions {
	debounceMs?: number
	validateOnChange?: boolean
	validateOnBlur?: boolean
}

type ValidationFunction = (value: string) => ValidationResult

export function useFormValidation<T extends Record<string, string>>(
	initialValues: T,
	validators: Partial<Record<keyof T, ValidationFunction>>,
	options: UseFormValidationOptions = {}
) {
	const {
		debounceMs = 300,
		validateOnChange = true,
		validateOnBlur = true
	} = options

	const [formData, setFormData] = useState<T>(initialValues)
	const [fields, setFields] = useState<Record<keyof T, FormField>>(() => {
		const initialFields = {} as Record<keyof T, FormField>
		Object.keys(initialValues).forEach(key => {
			initialFields[key as keyof T] = {
				value: initialValues[key as keyof T],
				error: null,
				isValid: true,
				suggestions: [],
				touched: false
			}
		})
		return initialFields
	})

	const [isSubmitting, setIsSubmitting] = useState(false)
	const [submitAttempted, setSubmitAttempted] = useState(false)
	const [debounceTimers, setDebounceTimers] = useState<Record<string, NodeJS.Timeout>>({})

	const validateField = useCallback((fieldName: keyof T, value: string): ValidationResult => {
		const validator = validators[fieldName]
		if (!validator) {
			return { isValid: true, error: null }
		}
		return validator(value)
	}, [validators])

	const updateField = useCallback((fieldName: keyof T, value: string, immediate = false) => {
		setFormData(prev => ({ ...prev, [fieldName]: value }))

		if (debounceTimers[fieldName as string]) {
			clearTimeout(debounceTimers[fieldName as string])
		}

		const performValidation = () => {
			const validation = validateField(fieldName, value)
			setFields(prev => ({
				...prev,
				[fieldName]: {
					...prev[fieldName],
					value,
					error: validation.error,
					isValid: validation.isValid,
					suggestions: validation.suggestions || []
				}
			}))
		}

		if (immediate || !validateOnChange) {
			performValidation()
		} else {
			const timer = setTimeout(performValidation, debounceMs)
			setDebounceTimers(prev => ({
				...prev,
				[fieldName as string]: timer
			}))
		}
	}, [validateField, debounceMs, validateOnChange, debounceTimers])

	const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		const fieldName = name as keyof T

		updateField(fieldName, value)

		if (submitAttempted && fields[fieldName]?.error) {
			setFields(prev => ({
				...prev,
				[fieldName]: {
					...prev[fieldName],
					error: null
				}
			}))
		}
	}, [updateField, submitAttempted, fields])

	const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		const fieldName = name as keyof T

		setFields(prev => ({
			...prev,
			[fieldName]: {
				...prev[fieldName],
				touched: true
			}
		}))

		if (validateOnBlur) {
			updateField(fieldName, value, true)
		}
	}, [updateField, validateOnBlur])

	const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
		const { name } = e.target
		const fieldName = name as keyof T

		if (!submitAttempted) {
			setFields(prev => ({
				...prev,
				[fieldName]: {
					...prev[fieldName],
					error: null
				}
			}))
		}
	}, [submitAttempted])

	const validateAll = useCallback((): boolean => {
		let isFormValid = true
		const newFields = { ...fields }

		Object.keys(formData).forEach(key => {
			const fieldName = key as keyof T
			const validation = validateField(fieldName, formData[fieldName])

			newFields[fieldName] = {
				...newFields[fieldName],
				error: validation.error,
				isValid: validation.isValid,
				suggestions: validation.suggestions || [],
				touched: true
			}

			if (!validation.isValid) {
				isFormValid = false
			}
		})

		setFields(newFields)
		return isFormValid
	}, [formData, fields, validateField])

	const handleSubmit = useCallback(async (
		onSubmit: (data: T) => Promise<void> | void,
		e?: React.FormEvent
	) => {
		if (e) {
			e.preventDefault()
		}

		setSubmitAttempted(true)
		setIsSubmitting(true)

		try {
			Object.values(debounceTimers).forEach(timer => clearTimeout(timer))
			setDebounceTimers({})

			const isValid = validateAll()

			if (isValid) {
				await onSubmit(formData)
			}
		} catch (error) {
			console.error('Form submission error:', error)
		} finally {
			setIsSubmitting(false)
		}
	}, [formData, validateAll, debounceTimers])

	const resetForm = useCallback(() => {
		setFormData(initialValues)
		setFields(() => {
			const resetFields = {} as Record<keyof T, FormField>
			Object.keys(initialValues).forEach(key => {
				resetFields[key as keyof T] = {
					value: initialValues[key as keyof T],
					error: null,
					isValid: true,
					suggestions: [],
					touched: false
				}
			})
			return resetFields
		})
		setSubmitAttempted(false)
		setIsSubmitting(false)

		Object.values(debounceTimers).forEach(timer => clearTimeout(timer))
		setDebounceTimers({})
	}, [initialValues, debounceTimers])

	const setFieldError = useCallback((fieldName: keyof T, error: string) => {
		setFields(prev => ({
			...prev,
			[fieldName]: {
				...prev[fieldName],
				error,
				isValid: false
			}
		}))
	}, [])

	const isFormValid = Object.values(fields).every(field => field.isValid)

	const isDirty = Object.keys(formData).some(key =>
		formData[key as keyof T] !== initialValues[key as keyof T]
	)

	useEffect(() => {
		return () => {
			Object.values(debounceTimers).forEach(timer => clearTimeout(timer))
		}
	}, [debounceTimers])

	return {
		formData,
		fields,
		isSubmitting,
		submitAttempted,
		isFormValid,
		isDirty,
		handleChange,
		handleBlur,
		handleFocus,
		handleSubmit,
		resetForm,
		setFieldError,
		validateAll
	}
}
