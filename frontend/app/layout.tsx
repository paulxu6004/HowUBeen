import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'HowUBeen - Life Tracker',
  description: 'Track your daily progress and stay accountable',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}