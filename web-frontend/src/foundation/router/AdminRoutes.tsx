import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { DashboardLayout } from '@/features/admin/ui/layout'
import DashboardPage from '@/pages/admin/DashboardPage/DashboardPage'
import UsersPage from '@/pages/admin/UsersPage/UsersPage'
import ExamsPage from '@/pages/admin/ExamsPage/ExamsPage'
import ProctoringPage from '@/pages/admin/ProctoringPage/ProctoringPage'
import SecurityPage from '@/pages/admin/SecurityPage/SecurityPage'
import RewardPage from '@/pages/admin/RewardPage/RewardPage'
import TokenManagementPage from '@/pages/admin/TokenManagementPage/TokenManagementPage'
import CoursesPage from '@/pages/admin/CoursesPage/CoursesPage'
import OrganizationsPage from '@/pages/admin/OrganizationsPage/OrganizationsPage'
import AdminPage from '@/pages/admin/AdminPage/AdminPage'
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage/AnalyticsPage'
import { CopyrightPage } from '@/pages/admin/CopyrightPage/CopyrightPage'
import CertifyPage from '@/pages/admin/CertifyPage/CertifyPage'
import MultisigPage from '@/pages/admin/MultisigPage/MultisigPage'

export default function AdminRoutes(): JSX.Element {
	return (
		<Routes>
			<Route element={<DashboardLayout />}>
				<Route index element={<Navigate to="dashboard" replace />} />
				<Route path="dashboard" element={<DashboardPage />} />
				<Route path="users" element={<UsersPage />} />
				<Route path="exams" element={<ExamsPage />} />
				<Route path="proctoring" element={<ProctoringPage />} />
				<Route path="security" element={<SecurityPage />} />
				<Route path="reward" element={<RewardPage />} />
				<Route path="tokens" element={<TokenManagementPage />} />
				<Route path="multisig" element={<MultisigPage />} />
				<Route path="courses" element={<CoursesPage />} />
				<Route path="organizations" element={<OrganizationsPage />} />
				<Route path="certify" element={<CertifyPage />} />
				<Route path="admin" element={<AdminPage />} />
				<Route path="analytics" element={<AnalyticsPage />} />
				<Route path="copyright" element={<CopyrightPage />} />
			</Route>
		</Routes>
	)
}
