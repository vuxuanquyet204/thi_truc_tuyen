import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			// Legacy aliases for backward compatibility
			{ find: '@/types', replacement: resolve(__dirname, 'src/foundation/types') },
			{ find: '@/contexts', replacement: resolve(__dirname, 'src/foundation/contexts') },
			{ find: '@/store', replacement: resolve(__dirname, 'src/foundation/store') },
			// New architecture aliases
			{ find: '@', replacement: resolve(__dirname, 'src') },
			{ find: '@/foundation', replacement: resolve(__dirname, 'src/foundation') },
			{ find: '@/shared', replacement: resolve(__dirname, 'src/shared') },
			{ find: '@/features', replacement: resolve(__dirname, 'src/features') },
			{ find: '@/pages', replacement: resolve(__dirname, 'src/pages') },
			{ find: '@/widgets', replacement: resolve(__dirname, 'src/widgets') },
			{ find: '@/data', replacement: resolve(__dirname, 'src/data') },
		],
	},
	build: {
		outDir: 'dist',
		assetsDir: 'assets',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(__dirname, 'index.html')
			}
		}
	},
	server: {
		port: 4173,
		host: true,
		open: false,
		strictPort: true,
		proxy: {
			// Proxy all /api requests to API Gateway at localhost:8080
			'/api': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
			// Proxy /identity requests to API Gateway (gateway will route to identity-service)
			'/identity': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
			// Proxy /analytics requests to API Gateway
			'/analytics': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
			// Proxy /course requests to API Gateway
			'/course': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
			// Proxy /files (file upload) requests to API Gateway
			'/files': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
			// Proxy Rust WebSocket Gateway — upgrades HTTP to WebSocket automatically
			'/ws': {
				target: 'http://localhost:8080',
				ws: true,
				changeOrigin: true,
				secure: false,
			},
			// Proxy Socket.IO — all service WS traffic through Spring Gateway (proctoring-service: 8082)
			'/socket.io': {
				target: 'http://localhost:8080',
				ws: true,
				changeOrigin: true,
				secure: false,
			},
			// Proxy SSE notification stream — EventSource doesn't support custom headers,
			// so the Vite proxy injects the JWT from localStorage into Authorization.
			// Note: More specific path must come BEFORE general /api/v1/notifications
			'/api/v1/notifications/stream': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
				configure: (proxy) => {
					proxy.on('proxyReq', (proxyReq) => {
						const token = localStorage.getItem('accessToken')
						if (token) {
							proxyReq.setHeader('Authorization', `Bearer ${token}`)
						}
					})
				},
			},
			'/api/v1/notifications': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
				configure: (proxy) => {
					proxy.on('proxyReq', (proxyReq) => {
						const token = localStorage.getItem('accessToken')
						if (token) {
							proxyReq.setHeader('Authorization', `Bearer ${token}`)
						}
					})
				},
			},
		}
	},
	preview: {
		port: 4173,
		host: true,
		strictPort: true,
		proxy: {
			// Proxy all /api requests to API Gateway at localhost:8080
			'/api': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
			// Proxy /identity requests to API Gateway
			'/identity': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
			// Proxy /analytics requests to API Gateway
			'/analytics': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
			// Proxy /course requests to API Gateway
			'/course': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
			// Proxy /files (file upload) requests to API Gateway
			'/files': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
			},
			// Proxy Rust WebSocket Gateway — upgrades HTTP to WebSocket automatically
			'/ws': {
				target: 'http://localhost:8080',
				ws: true,
				changeOrigin: true,
				secure: false,
			},
			// Proxy Socket.IO — all service WS traffic through Spring Gateway (proctoring-service: 8082)
			'/socket.io': {
				target: 'http://localhost:8080',
				ws: true,
				changeOrigin: true,
				secure: false,
			},
			// Proxy SSE notification stream — EventSource doesn't support custom headers,
			// More specific path must come BEFORE general /api/v1/notifications
			'/api/v1/notifications/stream': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
				configure: (proxy) => {
					proxy.on('proxyReq', (proxyReq) => {
						const token = localStorage.getItem('accessToken')
						if (token) {
							proxyReq.setHeader('Authorization', `Bearer ${token}`)
						}
					})
				},
			},
			// Proxy /api/v1/notifications REST calls
			'/api/v1/notifications': {
				target: 'http://localhost:8080',
				changeOrigin: true,
				secure: false,
				configure: (proxy) => {
					proxy.on('proxyReq', (proxyReq) => {
						const token = localStorage.getItem('accessToken')
						if (token) {
							proxyReq.setHeader('Authorization', `Bearer ${token}`)
						}
					})
				},
			},
		}
	},
})
