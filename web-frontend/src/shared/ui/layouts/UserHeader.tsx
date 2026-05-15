import React, { useState, useEffect } from 'react'
import { LogOut, Menu, X, Search, MessageCircle, Moon, Sun, ChevronDown, User, Trophy, Settings, Shield, Copyright, Clock } from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/foundation/store/hooks'
import { logoutUser } from '@/foundation/store'
import { useTheme } from '@/foundation/contexts/ThemeContext'
import Logo from '@/shared/ui/atoms/Logo/Logo'
import { NotificationBell } from '@/widgets/NotificationWidget'
import styles from './UserHeader.module.css'

export default function UserHeader(): JSX.Element {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
	const [userMenuOpen, setUserMenuOpen] = useState(false)
	const { theme, toggleTheme, isManualOverride } = useTheme()
	const [searchQuery, setSearchQuery] = useState('')
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const location = useLocation()
	const { user } = useAppSelector((state) => state.auth)

	const getActiveNavItem = () => {
		const path = location.pathname
		if (path.includes('/certify')) return 'certify'
		if (path.includes('/compete')) return 'compete'
		if (path.includes('/copyright')) return 'copyright'
		return 'prepare'
	}

	const handleLogout = () => {
		dispatch(logoutUser())
		navigate('/')
	}

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen)
	}

	const toggleUserMenu = () => {
		setUserMenuOpen(!userMenuOpen)
	}

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault()
		if (searchQuery.trim()) {
			console.log('Searching for:', searchQuery)
		}
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (userMenuOpen) {
				const target = event.target as HTMLElement
				if (!target.closest('[data-user-menu]')) {
					setUserMenuOpen(false)
				}
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [userMenuOpen])

	useEffect(() => {
		if (mobileMenuOpen) {
			document.body.style.overflow = 'hidden'
		} else {
			document.body.style.overflow = ''
		}

		return () => {
			document.body.style.overflow = ''
		}
	}, [mobileMenuOpen])

	return (
		<>
			<header className={styles.header}>
				<div className={styles.container}>
				{/* Left Side - Logo and Mobile Menu Button */}
				<div className={styles.leftSection}>
					<button
						className={styles.mobileMenuButton}
						onClick={toggleMobileMenu}
						aria-label="Toggle menu"
					>
						{mobileMenuOpen ? <X /> : <Menu />}
					</button>

					{/* Logo */}
					<div className={styles.logoContainer}>
						<Link to="/user" className={styles.logoLink}>
							<Logo text="EduPlatform" />
						</Link>
					</div>
				</div>

					{/* Center - Navigation Menu (Desktop) */}
					<nav className={styles.navigation}>
						{/* Prepare */}
						<Link 
							to="/user/prepare" 
							className={`${styles.navLink} ${getActiveNavItem() === 'prepare' ? styles.navLinkActive : ''}`}
						>
							Chuẩn bị
							{getActiveNavItem() === 'prepare' && (
								<div className={styles.navLinkUnderline} />
							)}
						</Link>

						{/* Certify */}
						<Link 
							to="/user/certify" 
							className={`${styles.navLink} ${getActiveNavItem() === 'certify' ? styles.navLinkActive : ''}`}
						>
							Chứng chỉ
							{getActiveNavItem() === 'certify' && (
								<div className={styles.navLinkUnderline} />
							)}
						</Link>

						{/* Compete */}
						<Link 
							to="/user/compete" 
							className={`${styles.navLink} ${getActiveNavItem() === 'compete' ? styles.navLinkActive : ''}`}
						>
							Thi đấu
							{getActiveNavItem() === 'compete' && (
								<div className={styles.navLinkUnderline} />
							)}
						</Link>
					</nav>

				{/* Right Side - Search, Notifications and User Actions */}
				<div className={styles.rightSection}>
					{/* Search Bar (Desktop) */}
					<div className={styles.searchContainer}>
						<Search className={styles.searchIcon} />
						<form onSubmit={handleSearch} className={styles.searchForm}>
							<input 
								type="text" 
								placeholder="Tìm kiếm thử thách..." 
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className={styles.searchInput}
							/>
						</form>
					</div>

					{/* Notifications */}
					<NotificationBell buttonClassName={styles.iconButton} />

					{/* Right Side Icons */}
					<div className={styles.rightIcons}>
						{/* Chat Icon */}
						<button className={styles.iconButton} aria-label="Chat">
							<MessageCircle />
						</button>

						{/* Theme Toggle */}
						<button 
							onClick={toggleTheme}
							className={styles.iconButton}
							title={`Chuyển sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}${isManualOverride ? '' : ' (theo trình duyệt)'}`}
							aria-label="Toggle theme"
						>
							{theme === 'dark' ? <Sun /> : <Moon />}
						</button>

						{/* User Avatar with Dropdown */}
						{user && (
							<div className={styles.userMenuContainer} data-user-menu>
								<button 
									onClick={toggleUserMenu}
									className={styles.userAvatar}
								>
									{user.name ? user.name.charAt(0).toUpperCase() : 'U'}
									<ChevronDown className={styles.userAvatarChevron} />
								</button>

								{/* User Dropdown Menu */}
								{userMenuOpen && (
									<div className={styles.userDropdown}>
										<div className={styles.userDropdownMenu}>
											{[
												{ icon: <User />, label: 'Hồ sơ', onClick: () => { navigate('/user/profile'); setUserMenuOpen(false); } },
												{ icon: <Clock />, label: 'Bài thi gần đây', onClick: () => { navigate('/user/exams/recent'); setUserMenuOpen(false); } },
												{ icon: <Trophy />, label: 'Bảng xếp hạng', onClick: () => { navigate('/user/leaderboard'); setUserMenuOpen(false); } },
												{ icon: <Settings />, label: 'Cài đặt', onClick: () => { navigate('/user/settings'); setUserMenuOpen(false); } },
												{ icon: <Shield />, label: 'Ví Multisig', onClick: () => { navigate('/user/multisig'); setUserMenuOpen(false); } },
												{ icon: <Copyright />, label: 'Bản quyền', onClick: () => { navigate('/user/copyright'); setUserMenuOpen(false); } },
												{ icon: <LogOut />, label: 'Đăng xuất', onClick: () => { handleLogout(); setUserMenuOpen(false); } }
											].map((item, index) => (
												<button
													key={index}
													onClick={item.onClick}
													className={styles.userMenuItem}
												>
													{item.icon}
													{item.label}
												</button>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</header>

		{/* Mobile Menu Overlay */}
		{mobileMenuOpen && (
			<div 
				className={`${styles.mobileMenuOverlay} ${mobileMenuOpen ? styles.mobileMenuOverlayOpen : ''}`}
				onClick={() => setMobileMenuOpen(false)}
			/>
		)}

		{/* Mobile Menu */}
		<div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
			{/* Mobile Menu Header */}
			<div className={styles.mobileMenuHeader}>
				<h2 className={styles.mobileMenuTitle}>Menu</h2>
				<button
					className={styles.mobileMenuCloseButton}
					onClick={() => setMobileMenuOpen(false)}
					aria-label="Close menu"
				>
					<X />
				</button>
			</div>

			{/* Mobile Search */}
			<div className={styles.mobileSearchContainer}>
				<form onSubmit={handleSearch} className={styles.mobileSearchForm}>
					<Search className={styles.mobileSearchIcon} />
					<input 
						type="text" 
						placeholder="Tìm kiếm thử thách..." 
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className={styles.mobileSearchInput}
					/>
				</form>
			</div>

			{/* Mobile Navigation */}
			<nav className={styles.mobileNav}>
				<Link 
					to="/user/prepare" 
					className={`${styles.mobileNavLink} ${getActiveNavItem() === 'prepare' ? styles.mobileNavLinkActive : ''}`}
					onClick={() => setMobileMenuOpen(false)}
				>
					Chuẩn bị
				</Link>

				<Link 
					to="/user/certify" 
					className={`${styles.mobileNavLink} ${getActiveNavItem() === 'certify' ? styles.mobileNavLinkActive : ''}`}
					onClick={() => setMobileMenuOpen(false)}
				>
					Chứng chỉ
				</Link>

				<Link 
					to="/user/compete" 
					className={`${styles.mobileNavLink} ${getActiveNavItem() === 'compete' ? styles.mobileNavLinkActive : ''}`}
					onClick={() => setMobileMenuOpen(false)}
				>
					Thi đấu
				</Link>
			</nav>

			{/* Mobile Actions */}
			{user && (
				<div className={styles.mobileActions}>
					<button 
						className={styles.mobileActionButton}
						onClick={() => { navigate('/user/profile'); setMobileMenuOpen(false); }}
					>
						<User />
						Hồ sơ
					</button>
					<button 
						className={styles.mobileActionButton}
						onClick={() => { navigate('/user/exams/recent'); setMobileMenuOpen(false); }}
					>
						<Clock />
						Bài thi gần đây
					</button>
					<button 
						className={styles.mobileActionButton}
						onClick={() => { navigate('/user/leaderboard'); setMobileMenuOpen(false); }}
					>
						<Trophy />
						Bảng xếp hạng
					</button>
					<button 
						className={styles.mobileActionButton}
						onClick={() => { navigate('/user/settings'); setMobileMenuOpen(false); }}
					>
						<Settings />
						Cài đặt
					</button>
					<button 
						className={styles.mobileActionButton}
						onClick={() => { navigate('/user/multisig'); setMobileMenuOpen(false); }}
					>
						<Shield />
						Ví Multisig
					</button>
					<button 
						className={styles.mobileActionButton}
						onClick={() => { navigate('/user/copyright'); setMobileMenuOpen(false); }}
					>
						<Copyright />
						Bản quyền
					</button>
					<button 
						className={styles.mobileActionButton}
						onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
					>
						<LogOut />
						Đăng xuất
					</button>
				</div>
			)}
		</div>
		</>
	)
}
