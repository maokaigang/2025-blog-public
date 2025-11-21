import '@/styles/globals.css'

import type { Metadata } from 'next'
import Layout from '@/layout'
import Head from '@/layout/head'

const title = '嘿猫',
	description = '有猫山人。'

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description
	},
	twitter: {
		title,
		description
	}
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang='en' suppressHydrationWarning>
			<Head />

			<body style={{ cursor: 'url(/images/cursor.svg) 2 1, auto' }}>
				<script
					dangerouslySetInnerHTML={{
						__html: `
						if (window && /windows|win32/i.test(navigator.userAgent)) {
							setTimeout(() => document.documentElement.classList.add('windows'), 0)			
						}
			      `
					}}
				/>

				<Layout>{children}</Layout>
			</body>
		</html>
	)
}
