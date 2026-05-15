import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { login, register } from '@/features/auth/api'
import { User, LoginCredentials } from '@/data/mocks/auth/mockAuthService'
import type { RegisterCredentials } from '@/features/auth/api'

export type UserRole = 'admin' | 'user' | null

export type AuthState = {
	loggedIn: boolean
	role: UserRole
	user: User | null
	loading: boolean
	error: string | null
}

export const selectAuth = (state: { auth: AuthState }) => state.auth
export const selectIsLoggedIn = (state: { auth: AuthState }) => state.auth.loggedIn
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user
export const selectUserRole = (state: { auth: AuthState }) => state.auth.role
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error

const initialState: AuthState = { 
	loggedIn: false, 
	role: null, 
	user: null,
	loading: false,
	error: null
}

export const loginUser = createAsyncThunk(
	'auth/loginUser',
	async (credentials: LoginCredentials, { rejectWithValue }) => {
		try {
			const response = await login(credentials)
			if (response.success && response.data && response.data.user) {
				const backendUser = response.data.user;
				const user: User = {
					id: backendUser.id.toString(),
					email: backendUser.email,
					name: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
					role: backendUser.roles[0]?.toLowerCase() as 'admin' | 'user',
					avatar: backendUser.avatarUrl
				};

				localStorage.setItem('accessToken', response.data.accessToken);
				localStorage.setItem('refreshToken', response.data.refreshToken);
				localStorage.setItem('user', JSON.stringify(user));

				return user
			} else {
				return rejectWithValue(response.message || 'Login failed')
			}
		} catch (error: any) {
			return rejectWithValue(error.message || 'Network error')
		}
	}
)

export const registerUser = createAsyncThunk(
	'auth/registerUser',
	async (credentials: RegisterCredentials, { rejectWithValue }) => {
		try {
			const response = await register(credentials)
			
			if (response.success) {
				// Return the credentials for success case even if no user data
				return response.user || { email: credentials.email, username: credentials.username }
			} else {
				return rejectWithValue(response.message || 'Registration failed')
			}
		} catch (error: any) {
			return rejectWithValue(error.message || 'Network error')
		}
	}
)

export const logoutUser = createAsyncThunk(
	'auth/logoutUser',
	async () => {
		// Placeholder: Call logout API if available
		// await logout()
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		localStorage.removeItem('user');
		return true
	}
)

export const checkAuth = createAsyncThunk(
	'auth/checkAuth',
	async (_, { rejectWithValue }) => {
		try {
			const userStr = localStorage.getItem('user');
			const accessToken = localStorage.getItem('accessToken');

			if (userStr && accessToken) {
				const user = JSON.parse(userStr);
				return user;
			} else {
				return rejectWithValue('Not authenticated');
			}
		} catch (error) {
			return rejectWithValue('Failed to parse user data');
		}
	}
)

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		clearError(state) {
			state.error = null
		},
	},
	extraReducers: (builder) => {
		builder
			// Login
			.addCase(loginUser.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
				state.loading = false
				state.loggedIn = true
				state.user = action.payload
				state.role = action.payload.role
				state.error = null
			})
			.addCase(loginUser.rejected, (state, action) => {
				state.loading = false
				state.loggedIn = false
				state.user = null
				state.role = null
				state.error = action.payload as string
			})
			// Register
			.addCase(registerUser.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(registerUser.fulfilled, (state, action) => {
				state.loading = false
				state.error = null
				// Optionally set loggedIn if register auto-logs in
			})
			.addCase(registerUser.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload as string
			})
			// Check auth
			.addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
				state.loggedIn = true
				state.user = action.payload
				state.role = action.payload.role
			})
			.addCase(checkAuth.rejected, (state) => {
				state.loggedIn = false
				state.user = null
				state.role = null
			})
			// Logout
			.addCase(logoutUser.fulfilled, (state) => {
				state.loggedIn = false
				state.user = null
				state.role = null
			})
		},
	})

export const { clearError } = authSlice.actions
export default authSlice.reducer


