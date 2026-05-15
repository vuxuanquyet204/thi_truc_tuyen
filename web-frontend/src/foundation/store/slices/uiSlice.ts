import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Toast {
	id: string
	type: 'success' | 'error' | 'warning' | 'info'
	title: string
	message?: string
	duration?: number
}

interface Modal {
	id: string
	isOpen: boolean
	data?: unknown
}

interface UIState {
	sidebar: {
		isOpen: boolean
		activeItem: string
	}
	toasts: Toast[]
	modals: Record<string, Modal>
	loading: {
		global: boolean
		byKey: Record<string, boolean>
	}
	breadcrumbs: { label: string; path?: string }[]
}

const initialState: UIState = {
	sidebar: {
		isOpen: true,
		activeItem: 'dashboard',
	},
	toasts: [],
	modals: {},
	loading: {
		global: false,
		byKey: {},
	},
	breadcrumbs: [],
}

const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		toggleSidebar(state) {
			state.sidebar.isOpen = !state.sidebar.isOpen
		},
		setSidebarOpen(state, action: PayloadAction<boolean>) {
			state.sidebar.isOpen = action.payload
		},
		setActiveSidebarItem(state, action: PayloadAction<string>) {
			state.sidebar.activeItem = action.payload
		},
		addToast(state, action: PayloadAction<Omit<Toast, 'id'>>) {
			state.toasts.push({
				id: Date.now().toString(),
				...action.payload,
			})
		},
		removeToast(state, action: PayloadAction<string>) {
			state.toasts = state.toasts.filter((t) => t.id !== action.payload)
		},
		clearToasts(state) {
			state.toasts = []
		},
		openModal(state, action: PayloadAction<{ id: string; data?: unknown }>) {
			state.modals[action.payload.id] = {
				id: action.payload.id,
				isOpen: true,
				data: action.payload.data,
			}
		},
		closeModal(state, action: PayloadAction<string>) {
			if (state.modals[action.payload]) {
				state.modals[action.payload].isOpen = false
			}
		},
		setModalData(state, action: PayloadAction<{ id: string; data: unknown }>) {
			if (state.modals[action.payload.id]) {
				state.modals[action.payload.id].data = action.payload.data
			}
		},
		setGlobalLoading(state, action: PayloadAction<boolean>) {
			state.loading.global = action.payload
		},
		setLoadingByKey(state, action: PayloadAction<{ key: string; loading: boolean }>) {
			state.loading.byKey[action.payload.key] = action.payload.loading
		},
		setBreadcrumbs(state, action: PayloadAction<{ label: string; path?: string }[]>) {
			state.breadcrumbs = action.payload
		},
	},
})

export const {
	toggleSidebar,
	setSidebarOpen,
	setActiveSidebarItem,
	addToast,
	removeToast,
	clearToasts,
	openModal,
	closeModal,
	setModalData,
	setGlobalLoading,
	setLoadingByKey,
	setBreadcrumbs,
} = uiSlice.actions

export default uiSlice.reducer
