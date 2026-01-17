'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * Home page - Dashboard/landing page
 * Shows quick navigation and recent activity
 */
export default function Home() {
  const [userId] = useState('user1') // In MVP, hardcode user. In production, use auth

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">HowUBeen</h1>
          <p className="text-xl text-gray-600">Your life tracker and accountability companion</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Create Period Card */}
          <Link href="/create-period">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">📅</div>
              <h2 className="text-2xl font-semibold mb-2">Create Life Period</h2>
              <p className="text-gray-600">Define a new period with focus areas and goals</p>
            </div>
          </Link>

          {/* Daily Check-in Card */}
          <Link href="/checkin">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">✍️</div>
              <h2 className="text-2xl font-semibold mb-2">Daily Check-in</h2>
              <p className="text-gray-600">Log your day with text or voice</p>
            </div>
          </Link>

          {/* Timeline Card */}
          <Link href="/timeline">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-semibold mb-2">Timeline</h2>
              <p className="text-gray-600">View your check-ins and progress</p>
            </div>
          </Link>

          {/* Weekly Summary Card */}
          <Link href="/weekly-summary">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
              <div className="text-4xl mb-4">📈</div>
              <h2 className="text-2xl font-semibold mb-2">Weekly Summary</h2>
              <p className="text-gray-600">AI-generated insights from your week</p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Stats</h3>
          <p className="text-gray-500 text-sm">Dashboard stats coming soon...</p>
        </div>
      </div>
    </main>
  )
}