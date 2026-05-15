import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface CTASectionProps {
	title?: string
	subtitle?: string
	primaryButtonText?: string
	primaryButtonLink?: string
	secondaryButtonText?: string
	secondaryButtonLink?: string
}

export default function CTASection({ 
	title = 'Sẵn sàng bắt đầu hành trình của bạn?',
	subtitle = 'Tham gia cùng hàng triệu lập trình viên đang xây dựng tương lai của họ với EduPlatform',
	primaryButtonText = 'Tạo tài khoản miễn phí',
	primaryButtonLink = '/auth/register',
	secondaryButtonText = 'Đã có tài khoản? Đăng nhập',
	secondaryButtonLink = '/auth/login'
}: CTASectionProps): JSX.Element {
	return (
		<section style={{ 
			padding: '80px 0', 
			background: 'var(--background)',
			textAlign: 'center'
		}}>
			<div className="container mx-auto px-6" style={{
				maxWidth: '800px',
				margin: '0 auto',
				padding: '0 24px'
			}}>
				<h2 style={{
					fontSize: '2.5rem',
					fontWeight: 700,
					marginBottom: '16px',
					fontFamily: 'var(--font-display)'
				}}>
					{title}
				</h2>
				<p style={{
					fontSize: '1.125rem',
					color: 'var(--muted-foreground)',
					marginBottom: '40px',
					lineHeight: 1.6
				}}>
					{subtitle}
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center items-center" style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '16px',
					justifyContent: 'center',
					alignItems: 'center'
				}}>
					<Link 
						to={primaryButtonLink}
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
						{primaryButtonText}
						<ArrowRight className="w-5 h-5" style={{ width: '20px', height: '20px' }} />
					</Link>
					
					<Link 
						to={secondaryButtonLink}
						className="text-[var(--accent)] hover:underline font-semibold"
						style={{
							color: 'var(--accent)',
							textDecoration: 'none',
							fontWeight: 600,
							fontSize: '16px',
							transition: 'opacity var(--transition-fast)'
						}}
					>
						{secondaryButtonText}
					</Link>
				</div>
			</div>
		</section>
	)
}
