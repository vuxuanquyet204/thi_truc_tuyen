import { useEffect, useRef, useState } from 'react'
import { cameraManager } from '@/features/proctoring/api/cameraManager'

export function useCameraMonitor() {
	const videoRef = useRef<HTMLVideoElement | null>(null)
	const [enabled, setEnabled] = useState<boolean>(false)
	const hasClientRef = useRef(false)

	useEffect(() => {
		return () => {
			if (hasClientRef.current) {
				cameraManager.decrementUsage()
				hasClientRef.current = false
			}
		}
	}, [])

	const start = async () => {
		if (!hasClientRef.current) {
			cameraManager.incrementUsage()
			hasClientRef.current = true
		}

		const stream = await cameraManager.start()

		if (videoRef.current) {
			cameraManager.attachToElement(videoRef.current)
		}

		setEnabled(!!stream)
	}

	const stop = () => {
		if (hasClientRef.current) {
			cameraManager.decrementUsage()
			hasClientRef.current = false
		}
		setEnabled(false)
	}

	return { videoRef, enabled, start, stop }
}


