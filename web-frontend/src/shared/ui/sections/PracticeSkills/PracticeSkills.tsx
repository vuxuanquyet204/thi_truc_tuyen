import React from 'react'
import { 
	TreePine, 
	Snowflake, 
	SquareDot, 
	Brain, 
	Code, 
	Coffee, 
	Zap,
	Database,
	Globe,
	Shield,
	Target
} from 'lucide-react'
import Badge from '@/shared/ui/atoms/Badge/Badge'
import SkillCard from '@/shared/ui/atoms/SkillCard/SkillCard'
import styles from './PracticeSkills.module.css'

interface Skill {
	id: string
	title: string
	icon: React.ReactNode
	category: 'algorithm' | 'language' | 'framework' | 'tool'
	progress?: number
	isCompleted?: boolean
}

interface PracticeSkillsProps {
	skills?: Skill[]
	onSkillClick?: (skillId: string) => void
}

export default function PracticeSkills({ 
	skills = [
		// Algorithms & Data Structures
		{ id: '1', title: 'Thuật toán', icon: <TreePine style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'algorithm', progress: 75 },
		{ id: '2', title: 'Cấu trúc dữ liệu', icon: <Snowflake style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'algorithm', progress: 60 },
		{ id: '3', title: 'Toán học', icon: <SquareDot style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'algorithm', progress: 45 },
		{ id: '4', title: 'Trí tuệ nhân tạo', icon: <Brain style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'algorithm', progress: 30 },
		
		// Programming Languages
		{ id: '5', title: 'C', icon: <Code style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'language', progress: 80 },
		{ id: '6', title: 'C++', icon: <Code style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'language', progress: 70 },
		{ id: '7', title: 'Java', icon: <Coffee style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'language', progress: 85 },
		{ id: '8', title: 'Python', icon: <Zap style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'language', progress: 90 },
		
		// Frameworks & Tools
		{ id: '9', title: 'Cơ sở dữ liệu', icon: <Database style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'tool', progress: 65 },
		{ id: '10', title: 'Phát triển Web', icon: <Globe style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'framework', progress: 55 },
		{ id: '11', title: 'Bảo mật', icon: <Shield style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'tool', progress: 40 },
		{ id: '12', title: 'Thiết kế hệ thống', icon: <Target style={{ width: 'clamp(18px, 2.5vw, 20px)', height: 'clamp(18px, 2.5vw, 20px)' }} />, category: 'algorithm', progress: 25 }
	],
	onSkillClick
}: PracticeSkillsProps): JSX.Element {
	const getCategoryColor = (category: string) => {
		switch (category) {
			case 'algorithm':
				return 'var(--primary)'
			case 'language':
				return 'var(--primary)'
			case 'framework':
				return 'var(--accent)'
			case 'tool':
				return 'var(--primary)'
			default:
				return 'var(--muted-foreground)'
		}
	}

	const getProgressColor = (progress: number) => {
		if (progress >= 80) return 'var(--primary)'
		if (progress >= 60) return 'var(--primary)'
		if (progress >= 40) return 'var(--accent)'
		return 'var(--destructive)'
	}

	return (
		<div className={`card stagger-load hover-lift interactive ${styles.container}`}>
			{/* Header */}
			<div className={styles.header}>
				<div className={styles.headerLeft}>
					<h2 className={styles.title}>
						Luyện tập kỹ năng
					</h2>
					<Badge variant="accent">
						Miễn phí
					</Badge>
				</div>
				<button className={styles.viewAllButton}>
					Xem tất cả
				</button>
			</div>

			{/* Skills Grid */}
			<div className={styles.skillsGrid}>
				{skills.map((skill) => (
					<SkillCard
						key={skill.id}
						skill={skill}
						onSkillClick={onSkillClick}
					/>
				))}
			</div>

			{/* Load More Button */}
			<div className={styles.loadMoreContainer}>
				<button className={styles.loadMoreButton}>
					Xem thêm kỹ năng
				</button>
			</div>
		</div>
	)
}
