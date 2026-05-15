import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')

// Bỏ StrictMode vì nó gây double-mount trong dev
// -> dẫn đến WebSocket connect/disconnect loop không cần thiết
// StrictMode chỉ hữu ích trong test, không cần thiết trong production
createRoot(rootElement).render(<App />)
