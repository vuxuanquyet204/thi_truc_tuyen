import React from 'react'
import styles from './Footer.module.css'

export default function Footer(): JSX.Element {
	const footerLinks = [
		'Môi trường',
		'Câu hỏi thường gặp', 
		'Về chúng tôi',
		'Trợ giúp',
		'Tuyển dụng',
		'Điều khoản dịch vụ',
		'Chính sách bảo mật'
	]

	return (
		<footer className={styles.footer}>
			<div className={styles.linksContainer}>
				{footerLinks.map((link, index) => (
					<a
						key={index}
						href="#"
						className={styles.footerLink}
					>
						{link}
					</a>
				))}
			</div>
		</footer>
	)
}
