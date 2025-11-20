import { useEffect, useMemo, useRef, useState } from 'react'

import Card from '@/components/card'
import { useCenterStore } from '@/hooks/use-center'
import { styles as hiCardStyles } from './hi-card'
import { CARD_SPACING } from '@/consts'
import { styles as clockCardStyles } from './clock-card'
import { styles as calendarCardStyles } from './calendar-card'
import MusicSVG from '@/svgs/music.svg'
import PlaySVG from '@/svgs/play.svg'
import PauseSVG from '@/svgs/pause.svg'

export const styles = {
	width: 293,
	height: 66,
	offset: 120,
	order: 6
}

export default function MusicCard() {
	const center = useCenterStore()
	const [playlist, setPlaylist] = useState<string[]>([])
	const [currentIndex, setCurrentIndex] = useState(0)
	const [isPlaying, setIsPlaying] = useState(false)
	const [isLoading, setIsLoading] = useState(true)
	const [progress, setProgress] = useState(0)
	const audioRef = useRef<HTMLAudioElement | null>(null)
	const playlistRef = useRef<string[]>([])
	const lastTrackRef = useRef<string>('')

	useEffect(() => {
		let isMounted = true

		const loadMusic = async () => {
			try {
				const res = await fetch('/api/music')
				if (!res.ok) {
					throw new Error('Failed to fetch music list')
				}
				const data = (await res.json()) as { files?: string[] }
				if (!isMounted) return
				setPlaylist(data.files ?? [])
			} catch {
				if (!isMounted) return
				setPlaylist([])
			} finally {
				if (isMounted) {
					setIsLoading(false)
				}
			}
		}

		loadMusic()

		return () => {
			isMounted = false
		}
	}, [])

	useEffect(() => {
		if (audioRef.current) return

		const audio = new Audio()
		audio.preload = 'auto'
		audioRef.current = audio

		const handleEnded = () => {
			const list = playlistRef.current
			if (!list.length) {
				setIsPlaying(false)
				setProgress(0)
				return
			}
			setCurrentIndex(prev => (prev + 1) % list.length)
		}

		const handleTimeUpdate = () => {
			if (!audio.duration || Number.isNaN(audio.duration)) {
				setProgress(0)
				return
			}
			setProgress(Math.min(1, Math.max(0, audio.currentTime / audio.duration)))
		}

		audio.addEventListener('ended', handleEnded)
		audio.addEventListener('timeupdate', handleTimeUpdate)

		return () => {
			audio.pause()
			audio.removeEventListener('ended', handleEnded)
			audio.removeEventListener('timeupdate', handleTimeUpdate)
		}
	}, [])

	useEffect(() => {
		playlistRef.current = playlist

		if (!playlist.length) {
			lastTrackRef.current = ''
			setProgress(0)
			setIsPlaying(prev => (prev ? false : prev))
			if (currentIndex !== 0) {
				setCurrentIndex(0)
			}
			return
		}

		if (currentIndex >= playlist.length) {
			setCurrentIndex(0)
		}
	}, [playlist, currentIndex])

	useEffect(() => {
		const audio = audioRef.current
		if (!audio) return

		if (!playlist.length) {
			audio.pause()
			audio.removeAttribute('src')
			return
		}

		const track = playlist[currentIndex]
		if (!track) return

		if (track !== lastTrackRef.current) {
			lastTrackRef.current = track
			audio.src = `/music/${encodeURIComponent(track)}`
			audio.currentTime = 0
			setProgress(0)
		}

		if (isPlaying) {
			audio.play().catch(() => {
				setIsPlaying(false)
			})
		} else {
			audio.pause()
		}
	}, [playlist, currentIndex, isPlaying])

	const handleToggle = () => {
		if (!playlist.length || isLoading) return
		setIsPlaying(prev => !prev)
	}

	const currentTrack = playlist[currentIndex]
	const trackLabel = useMemo(() => {
		if (isLoading) return 'Loading music...'
		if (!playlist.length) return 'No music found'

		try {
			return decodeURIComponent(currentTrack ?? '').replace(/\.[^/.]+$/, '')
		} catch {
			return (currentTrack ?? 'Unknown track').replace(/\.[^/.]+$/, '')
		}
	}, [currentTrack, playlist.length, isLoading])

	const progressWidth = `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%`
	const isButtonDisabled = isLoading || !playlist.length

	return (
		<Card
			order={styles.order}
			width={styles.width}
			height={styles.height}
			x={center.x + CARD_SPACING + hiCardStyles.width / 2 - styles.offset}
			y={center.y - clockCardStyles.offset + CARD_SPACING + calendarCardStyles.height + CARD_SPACING}
			className='flex items-center gap-3'>
			<MusicSVG className='h-8 w-8' />

			<div className='flex-1'>
				<div className='text-secondary text-sm'>{trackLabel}</div>

				<div className='mt-1 h-2 rounded-full bg-white/60'>
					<div className='bg-linear h-full rounded-full transition-all' style={{ width: progressWidth }} />
				</div>
			</div>

			<button
				type='button'
				onClick={handleToggle}
				disabled={isButtonDisabled}
				aria-pressed={isPlaying}
				aria-label={isPlaying ? 'Pause music' : 'Play music'}
				className='flex h-10 w-10 items-center justify-center rounded-full bg-white transition disabled:cursor-not-allowed disabled:opacity-60'>
				{isPlaying ? <PauseSVG className='h-4 w-4' /> : <PlaySVG className='ml-1 h-4 w-4' />}
			</button>
		</Card>
	)
}
