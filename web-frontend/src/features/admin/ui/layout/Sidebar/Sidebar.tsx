import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
	LayoutDashboard,
	Users,
	FileText,
	Video,
	Lock,
	Award,
	Coins,
	BookOpen,
	Building,
	Server,
	BarChart,
	Copyright,
	Badge,
	ShieldCheck,
} from 'lucide-react'
import styles from './Sidebar.module.css'

type Item = { icon: React.ReactNode; label: string; path: string }

const items: Item[] = [
	{ icon: <LayoutDashboard className="w-5 h-5" />, label: 'Tổng quan', path: '/admin/dashboard' },
	{ icon: <Users className="w-5 h-5" />, label: 'Quản lý người dùng', path: '/admin/users' },
	{ icon: <FileText className="w-5 h-5" />, label: 'Quản lý bài thi', path: '/admin/exams' },
	{ icon: <Video className="w-5 h-5" />, label: 'Giám sát & Chống gian lận', path: '/admin/proctoring' },
	{ icon: <Lock className="w-5 h-5" />, label: 'Bảo mật & Blockchain', path: '/admin/security' },
	{ icon: <ShieldCheck className="w-5 h-5" />, label: 'Quản lý Multisig', path: '/admin/multisig' },
	{ icon: <Award className="w-5 h-5" />, label: 'Hệ thống thưởng Token', path: '/admin/reward' },
	{ icon: <Coins className="w-5 h-5" />, label: 'Quản lý Token', path: '/admin/tokens' },
	{ icon: <BookOpen className="w-5 h-5" />, label: 'Quản lý khóa học', path: '/admin/courses' },
	{ icon: <Building className="w-5 h-5" />, label: 'Quản lý tổ chức', path: '/admin/organizations' },
	{ icon: <Badge className="w-5 h-5" />, label: 'Quản lý chứng chỉ', path: '/admin/certify' },
	{ icon: <Server className="w-5 h-5" />, label: 'Quản trị hệ thống', path: '/admin/admin' },
	{ icon: <BarChart className="w-5 h-5" />, label: 'Phân tích & Báo cáo', path: '/admin/analytics' },
	{ icon: <Copyright className="w-5 h-5" />, label: 'Bản quyền tài liệu', path: '/admin/copyright' },
]

export default function Sidebar(): JSX.Element {
	const location = useLocation()

	return (
		<aside
			className={styles.slideIn}
			style={{
				background: 'var(--sidebar)',
				borderRight: '1px solid var(--sidebar-border)',
				width: 260,
				overflowY: 'auto',
				overflowX: 'hidden',
				height: 'calc(100vh - 60px)',
				maxHeight: 'calc(100vh - 60px)',
				position: 'fixed',
				top: 60,
				left: 0,
				zIndex: 1000
			}}>
			<nav style={{ paddingLeft: 16, paddingRight: 16, paddingTop: 24, paddingBottom: 24 }}>
				{items.map((item) => {
					const isActive = location.pathname === item.path
					return (
						<Link
							key={item.label}
							to={item.path}
							className={`${styles.menuItem} ${isActive ? styles.active : ''}`}
						>
							<span>{item.icon}</span>
							<span className={styles.menuItemLabel}>{item.label}</span>
						</Link>
					)
				})}
			</nav>
		</aside>
	)
}
