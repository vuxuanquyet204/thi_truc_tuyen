import React from 'react'
import { Code, Users, Award, Shield, Zap, Target } from 'lucide-react'

interface Feature {
	icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
	title: string
	description: string
}

interface FeaturesSectionProps {
	features?: Feature[]
}

export default function FeaturesSection({ 
	features = [
		{
			icon: Code,
			title: 'Luyện tập lập trình',
			description: 'Nâng cao kỹ năng lập trình với hàng nghìn thử thách trên nhiều ngôn ngữ và cấp độ khó khác nhau.'
		},
		{
			icon: Users,
			title: 'Tham gia cộng đồng',
			description: 'Kết nối với hàng triệu lập trình viên trên toàn thế giới, chia sẻ giải pháp và học hỏi lẫn nhau.'
		},
		{
			icon: Award,
			title: 'Nhận chứng chỉ',
			description: 'Xác thực kỹ năng của bạn với chứng chỉ được công nhận trong ngành, giúp thúc đẩy sự nghiệp.'
		},
		{
			icon: Shield,
			title: 'Nền tảng an toàn',
			description: 'Luyện tập trong môi trường an toàn với công cụ phát hiện đạo văn và đánh giá công bằng.'
		},
		{
			icon: Zap,
			title: 'Phản hồi thời gian thực',
			description: 'Nhận phản hồi ngay lập tức về mã của bạn với giải thích chi tiết và gợi ý tối ưu hóa.'
		},
		{
			icon: Target,
			title: 'Chuẩn bị nghề nghiệp',
			description: 'Chuẩn bị cho phỏng vấn kỹ thuật với bài kiểm tra mô phỏng và các tình huống giải quyết vấn đề thực tế.'
		}
	]
}: FeaturesSectionProps): JSX.Element {
	return (
		<section style={{ padding: '80px 0', background: 'var(--background)' }}>
			<div className="container mx-auto px-6" style={{
				maxWidth: '1200px',
				margin: '0 auto',
				padding: '0 24px'
			}}>
				<div className="text-center mb-16" style={{ textAlign: 'center', marginBottom: '64px' }}>
					<h2 style={{
						fontSize: '2.5rem',
						fontWeight: 700,
						marginBottom: '16px',
						fontFamily: 'var(--font-display)'
					}}>
						Tại sao chọn EduPlatform?
					</h2>
					<p style={{
						fontSize: '1.125rem',
						color: 'var(--muted-foreground)',
						maxWidth: '600px',
						margin: '0 auto',
						lineHeight: 1.6
					}}>
						Mọi thứ bạn cần để trở thành một lập trình viên giỏi hơn và thăng tiến trong sự nghiệp
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
					gap: '32px'
				}}>
					{features.map((feature, index) => (
						<div 
							key={index}
							className="card hover-lift interactive"
							style={{
								background: 'var(--gradient-card)',
								border: '1px solid var(--glass-border)',
								borderRadius: 'var(--radius-lg)',
								padding: '32px',
								backdropFilter: 'blur(10px)',
								WebkitBackdropFilter: 'blur(10px)',
								transition: 'all var(--transition-normal)',
								position: 'relative',
								overflow: 'hidden'
							}}
						>
							<div style={{
								width: '60px',
								height: '60px',
								background: 'var(--gradient-primary)',
								borderRadius: 'var(--radius-lg)',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								marginBottom: '24px',
								boxShadow: 'var(--shadow-md)'
							}}>
								<feature.icon 
									className="w-8 h-8 text-[var(--primary-foreground)]"
									style={{ width: '32px', height: '32px', color: 'var(--primary-foreground)' }}
								/>
							</div>
							<h3 style={{
								fontSize: '1.25rem',
								fontWeight: 600,
								marginBottom: '12px',
								fontFamily: 'var(--font-display)'
							}}>
								{feature.title}
							</h3>
							<p style={{
								color: 'var(--muted-foreground)',
								lineHeight: 1.6,
								margin: 0
							}}>
								{feature.description}
							</p>
						</div>
					))}
				</div>
			</div>
		</section>
	)
}
