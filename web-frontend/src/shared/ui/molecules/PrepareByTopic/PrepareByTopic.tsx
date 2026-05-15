import React from 'react'
import { Puzzle, Database, Binary, Braces, Code, FileJson } from 'lucide-react'

interface Topic {
	icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
	title: string
}

interface PrepareByTopicProps {
	topics?: Topic[]
	onTopicClick?: (title: string) => void
}

export default function PrepareByTopic({ 
	topics,
	onTopicClick
}: PrepareByTopicProps): JSX.Element {
	const defaultTopics: Topic[] = [
		{ icon: Puzzle, title: 'Problem Solving' },
		{ icon: Database, title: 'SQL' },
		{ icon: Binary, title: 'Algorithms' },
		{ icon: Braces, title: 'Data Structures' },
		{ icon: Code, title: 'Python' },
		{ icon: FileJson, title: 'JavaScript' }
	]

	const topicsToUse = topics || defaultTopics

	const handleTopicClick = (title: string) => {
		if (onTopicClick) {
			onTopicClick(title)
		} else {
			console.log(`Clicked on ${title}`)
		}
	}

	return (
		<div className="stagger-load" style={{ animationDelay: '300ms' }}>
			<h2 
				className="text-2xl font-bold mb-4"
				style={{ marginBottom: 'var(--space-4)', marginTop: 0, marginLeft: 0, marginRight: 0 }}
			>
				Prepare by Topic
			</h2>
			<div 
				className="topic-grid"
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
					gap: '16px'
				}}
			>
				{topicsToUse.map((topic, index) => (
					<div 
						key={index}
						className="card text-center hover-lift hover-glow interactive"
						onClick={() => handleTopicClick(topic.title)}
						style={{
							textAlign: 'center',
							cursor: 'pointer',
							background: 'var(--gradient-card)',
							border: '1px solid var(--glass-border)',
							borderRadius: 'var(--radius-lg)',
							backdropFilter: 'blur(10px)',
							WebkitBackdropFilter: 'blur(10px)',
							transition: 'all var(--transition-normal)',
							position: 'relative',
							overflow: 'hidden',
							padding: 'var(--space-5)'
						}}
					>
						<topic.icon 
							className="w-10 h-10 mx-auto mb-3 text-[var(--accent)] icon-enhanced"
							style={{ 
								width: '40px', 
								height: '40px', 
								margin: '0 auto 12px', 
								color: 'var(--accent)',
								filter: 'drop-shadow(0 0 8px currentColor)'
							}} 
						/>
						<h3 
							className="text-base font-semibold"
							style={{ margin: 0 }}
						>
							{topic.title}
						</h3>
					</div>
				))}
			</div>
		</div>
	)
}
