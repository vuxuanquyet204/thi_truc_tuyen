import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/foundation/store'
import AuthLayout from '@/shared/ui/layouts/AuthLayout'
import UserLayout from '@/shared/ui/layouts/UserLayout'
import AdminRoutes from '@/foundation/router/AdminRoutes'
import ProtectedRoute from '@/foundation/router/ProtectedRoute'
import { checkAuth } from '@/foundation/store/slices/authSlice'

// Auth pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import OAuthCallbackPage from '@/pages/auth/OAuthCallbackPage'

// Home pages
import LandingPage from '@/pages/home/LandingPage'
import UserHomePage from '@/pages/home/UserHomePage'

// Profile pages
import ProfilePage from '@/pages/profile/ProfilePage'
import SettingsPage from '@/pages/profile/SettingsPage'

// Course pages
import CourseDetailPage from '@/pages/courses/CourseDetailPage'
import CourseLearnPage from '@/pages/courses/CourseLearnPage'
import UserCoursesPage from '@/pages/courses/UserCoursesPage'

// Exam pages
import ExamPage from '@/pages/exams/ExamPage'
import ExamDetailPage from '@/pages/exams/ExamDetailPage'
import ExamPreCheckPage from '@/pages/exams/ExamPreCheckPage'
import ExamTakingPage from '@/pages/exams/ExamTakingPage'
import ExamResultPage from '@/pages/exams/ExamResultPage'
import ExamStoppedPage from '@/pages/exams/ExamStoppedPage/ExamStoppedPage'
import RecentExamsPage from '@/pages/exams/RecentExamsPage'
import ExamSchedulePage from '@/pages/exams/ExamSchedulePage'

// Contest pages
import CompetePage from '@/pages/contests/CompetePage'
import ContestDetailPage from '@/pages/contests/ContestDetailPage'

// Certification pages
import CertifyPage from '@/pages/certifications/CertifyPage'
import CertificationDetailPage from '@/pages/certifications/CertificationDetailPage'

// Leaderboard pages
import LeaderboardPage from '@/pages/leaderboard/LeaderboardPage'

// Reward pages
import RewardPage from '@/pages/rewards/RewardPage'
import RewardStorePage from '@/pages/rewards/RewardStorePage'
import MultisigWalletPage from '@/pages/rewards/MultisigWalletPage'

// Copyright pages
import CopyrightPage from '@/pages/copyright/CopyrightPage'
import CheckDuplicatePage from '@/pages/copyright/CheckDuplicatePage'

// Prepare pages
import PreparePage from '@/pages/prepare/PreparePage'

export default function UserRoutes(): JSX.Element {
	const dispatch = useAppDispatch()
	const { loggedIn } = useAppSelector((state) => state.auth)

	React.useEffect(() => {
		dispatch(checkAuth())
	}, [dispatch])

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/auth/*" element={<AuthLayout />} />
				<Route path="/login" element={<Navigate to="/auth" replace />} />
				<Route path="/oauth/callback" element={<OAuthCallbackPage />} />

				<Route path="/admin/*" element={
					<ProtectedRoute requiredRole="admin">
						<AdminRoutes />
					</ProtectedRoute>
				} />

				<Route path="/" element={<LandingPage />} />

				<Route path="/user/*" element={
					<ProtectedRoute requiredRole="user">
						<UserLayout />
					</ProtectedRoute>
				}>
					<Route index element={<UserHomePage />} />
					<Route path="home" element={<UserHomePage />} />
					<Route path="prepare" element={<PreparePage />} />
					<Route path="certify" element={<CertifyPage />} />
					<Route path="certify/:certificationId" element={<CertificationDetailPage />} />
					<Route path="compete" element={<CompetePage />} />
					<Route path="compete/:contestId" element={<ContestDetailPage />} />
					<Route path="exam" element={<ExamPage />} />
					<Route path="exams/recent" element={<RecentExamsPage />} />
					<Route path="exams/schedule" element={<ExamSchedulePage />} />
					<Route path="courses" element={<UserCoursesPage />} />
					<Route path="courses/:courseId" element={<CourseDetailPage />} />
					<Route path="reward" element={<RewardPage />} />
					<Route path="rewards" element={<RewardPage />} />
					<Route path="rewards/store" element={<RewardStorePage />} />
					<Route path="copyright" element={<CopyrightPage />} />
					<Route path="check-duplicate" element={<CheckDuplicatePage />} />
					<Route path="multisig" element={<MultisigWalletPage />} />
					<Route path="profile" element={<ProfilePage />} />
					<Route path="settings" element={<SettingsPage />} />
					<Route path="leaderboard" element={<LeaderboardPage />} />
				</Route>

				<Route path="/exam/:examId/pre-check" element={
					<ProtectedRoute requiredRole="user">
						<ExamPreCheckPage />
					</ProtectedRoute>
				} />
				<Route path="/exam/:examId/take" element={
					<ProtectedRoute requiredRole="user">
						<ExamTakingPage />
					</ProtectedRoute>
				} />
				<Route path="/exam/:examId/result" element={
					<ProtectedRoute requiredRole="user">
						<ExamResultPage />
					</ProtectedRoute>
				} />
				<Route path="/exam/stopped" element={
					<ProtectedRoute requiredRole="user">
						<ExamStoppedPage />
					</ProtectedRoute>
				} />
				<Route path="/exam/:examId/detail" element={
					<ProtectedRoute requiredRole="user">
						<ExamDetailPage />
					</ProtectedRoute>
				} />

				<Route path="/user/courses/:courseId/learn" element={
					<ProtectedRoute requiredRole="user">
						<CourseLearnPage />
					</ProtectedRoute>
				} />

				<Route path="*" element={<div style={{ padding: 24 }}>Not Found</div>} />
			</Routes>
		</BrowserRouter>
	)
}
