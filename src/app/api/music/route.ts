import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const MUSIC_DIR = path.join(process.cwd(), 'public', 'music')

export async function GET() {
	try {
		const files = await fs.readdir(MUSIC_DIR)
		const musicFiles = files.filter(file => file.toLowerCase().endsWith('.mp3'))
		return NextResponse.json({ files: musicFiles })
	} catch (error) {
		console.error('Unable to read music directory', error)
		return NextResponse.json({ files: [] }, { status: 200 })
	}
}
