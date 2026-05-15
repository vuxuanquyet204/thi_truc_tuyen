import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/foundation/store/hooks'
import { Settings, LogOut } from 'lucide-react'
import { logoutUser } from '@/foundation/store'
import Logo from '@/shared/ui/atoms/Logo'
import { NotificationBell } from '@/widgets/NotificationWidget'
import styles from './Header.module.css'

export default function Header(): JSX.Element {
	const dispatch = useAppDispatch()
	const navigate = useNavigate()
	const { user } = useAppSelector((state) => state.auth)

	const handleLogout = () => {
		dispatch(logoutUser())
		navigate('/')
	}

	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<Logo text="EduPlatform Admin" />

				<div className={styles.actions}>
					<NotificationBell buttonClassName={styles.iconBtn} />

					<button
						aria-label="Settings"
						className={styles.iconBtn}
					>
						<Settings style={{ width: 20, height: 20 }} />
					</button>

					<div className={styles.userSection}>
						<div className={styles.userInfo}>
							<img
								src={user?.avatar || 'https://placehold.co/32x32'}
								alt="Profile"
								className={styles.userAvatar}
							/>
							<div>
								<p className={styles.userName}>
									{user?.name || 'Người quản trị'}
								</p>
								<p className={styles.userRole}>
									{user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
								</p>
							</div>
						</div>
						<button
							onClick={handleLogout}
							className={styles.logoutBtn}
						>
							<LogOut style={{ width: 16, height: 16 }} />
							Đăng xuất
						</button>
					</div>
				</div>
			</div>
		</header>
	)
}
