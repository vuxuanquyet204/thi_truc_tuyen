import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'

interface HeroSectionProps {
	stats?: Array<{ number: string; label: string }>
}

export default function HeroSection({ 
	stats = [
		{ number: '2M+', label: 'Lập trình viên hoạt động' },
		{ number: '50K+', label: 'Bài tập lập trình' },
		{ number: '100+', label: 'Ngôn ngữ lập trình' },
		{ number: '95%', label: 'Tỷ lệ thành công' }
	]
}: HeroSectionProps): JSX.Element {
	return (
		<section style={{
			padding: '120px 0 80px',
			background: 'var(--gradient-background)',
			position: 'relative',
			overflow: 'hidden'
		}}>
			<div className="container mx-auto px-6" style={{
				maxWidth: '1200px',
				margin: '0 auto',
				padding: '0 24px',
				position: 'relative',
				zIndex: 1
			}}>
				<div className="text-center" style={{ textAlign: 'center' }}>
					<h1 style={{
						fontSize: 'clamp(2.5rem, 5vw, 4rem)',
						fontWeight: 800,
						lineHeight: 1.1,
						marginBottom: '24px',
						background: 'linear-gradient(135deg, var(--foreground) 0%, var(--accent) 100%)',
						backgroundClip: 'text',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						fontFamily: 'var(--font-display)'
					}}>
						Làm chủ kỹ năng lập trình
						<br />
						<span style={{ color: 'var(--accent)' }}>Xây dựng tương lai của bạn</span>
					</h1>
					
					<p style={{
						fontSize: '1.25rem',
						color: 'var(--muted-foreground)',
						maxWidth: '600px',
						margin: '0 auto 40px',
						lineHeight: 1.6
					}}>
						Tham gia cùng hàng triệu lập trình viên trên toàn thế giới. Luyện tập lập trình, nhận chứng chỉ 
						và chuẩn bị cho công việc mơ ước với nền tảng học tập toàn diện của chúng tôi.
					</p>

					<div className="flex flex-col sm:flex-row gap-4 justify-center items-center" style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '16px',
						justifyContent: 'center',
						alignItems: 'center',
						marginBottom: '60px'
					}}>
						<Link 
							to="/auth/login"
							className="px-8 py-4 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-lg font-semibold text-lg hover:opacity-90 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
							style={{
								padding: '16px 32px',
								background: 'var(--gradient-accent)',
								color: 'var(--accent-foreground)',
								borderRadius: 'var(--radius-lg)',
								fontWeight: 600,
								fontSize: '18px',
								textDecoration: 'none',
								display: 'flex',
								alignItems: 'center',
								gap: '8px',
								transition: 'all var(--transition-normal)',
								boxShadow: 'var(--shadow-lg)'
							}}
						>
							Bắt đầu miễn phí
							<ArrowRight className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
						</Link>
						
						<button className="px-8 py-4 border border-[var(--border)] rounded-lg font-semibold text-lg hover:bg-[var(--muted)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2" style={{
							padding: '16px 32px',
							border: '1px solid var(--border)',
							borderRadius: 'var(--radius-lg)',
							background: 'var(--background)',
							color: 'var(--foreground)',
							fontWeight: 600,
							fontSize: '18px',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
							transition: 'all var(--transition-normal)'
						}}>
							<Play className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
							Xem Demo
						</button>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-8" style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(2, 1fr)',
						gap: '32px',
						maxWidth: '800px',
						margin: '0 auto'
					}}>
						{stats.map((stat, index) => (
							<div key={index} className="text-center" style={{ textAlign: 'center' }}>
								<div style={{
									fontSize: '2.5rem',
									fontWeight: 700,
									color: 'var(--accent)',
									marginBottom: '8px',
									fontFamily: 'var(--font-display)'
								}}>
									{stat.number}
								</div>
								<div style={{
									fontSize: '0.875rem',
									color: 'var(--muted-foreground)',
									fontWeight: 500
								}}>
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}
