import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'

export default function DashboardLayout(): JSX.Element {
	return (
		<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
			<Header />

			<div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
				<Sidebar />

				<main style={{ 
					flex: 1, 
					overflowY: 'auto', 
					minWidth: 0,
					marginLeft: 260,
					height: 'calc(100vh - 60px)'
				}}>
					<Outlet />
					
					<footer style={{ background: 'var(--card)', borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)', padding: '16px 24px', textAlign: 'center', fontSize: 14, marginTop: '32px' }}>
						<p>EduPlatform © 2023 | Version 1.0.0 | <a href="#" style={{ color: 'inherit' }}>Help & Support</a></p>
					</footer>
				</main>
			</div>
		</div>
	)
}
