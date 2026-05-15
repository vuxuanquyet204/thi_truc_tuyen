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
import '@/features/admin/ui/common/styles/sidebar.css'

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
		<aside className="sidebar-slide-in" style={{ 
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
							className="menu-item-select hover-lift interactive" 
							style={{ 
								display: 'flex', 
								alignItems: 'center', 
								padding: '12px 16px', 
								borderRadius: 'var(--radius-md)', 
								color: isActive ? 'var(--sidebar-accent-foreground)' : 'var(--sidebar-foreground)', 
								background: isActive ? 'var(--sidebar-accent)' : 'transparent', 
								marginBottom: 4,
								textDecoration: 'none',
								fontSize: 15,
								fontWeight: isActive ? 500 : 400,
								transition: 'all var(--transition-normal)',
								position: 'relative',
								overflow: 'hidden'
							}}
							onMouseEnter={(e) => {
								if (!isActive) {
									e.currentTarget.style.background = 'var(--sidebar-hover)'
									e.currentTarget.style.color = 'var(--sidebar-hover-foreground)'
									e.currentTarget.style.transform = 'translateX(4px)'
								}
							}}
							onMouseLeave={(e) => {
								if (!isActive) {
									e.currentTarget.style.background = 'transparent'
									e.currentTarget.style.color = 'var(--sidebar-foreground)'
									e.currentTarget.style.transform = 'translateX(0)'
								}
							}}
						>
							<span style={{ marginRight: 12 }}>{item.icon}</span>
							<span>{item.label}</span>
						</Link>
					)
				})}
			</nav>
		</aside>
	)
}
