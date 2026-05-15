import React from 'react'
import HeroSection from '@/shared/ui/sections/HeroSection'
import FeaturesSection from '@/shared/ui/sections/FeaturesSection'
import TestimonialsSection from '@/shared/ui/sections/TestimonialsSection'
import CTASection from '@/shared/ui/sections/CTASection'
import styles from './LandingPage.module.css'

export default function LandingPage(): JSX.Element {
	return (
		<div className={styles.page}>
			<HeroSection />
			<FeaturesSection />
			<TestimonialsSection />
			<CTASection />
		</div>
	)
}
