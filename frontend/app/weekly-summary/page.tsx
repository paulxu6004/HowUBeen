'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { format } from 'date-fns'

/**
 * Weekly Summary Page
 * Displays AI-generated weekly summaries
 */
interface Summary {
  id: number
  userId: string
  periodId: number | null
  weekStartDate: string
  weekEndDate: string
  summaryText: string
  createdAt: string
}

export default function WeeklySummary() {
  const [userId] = useState('user1') // In MVP, hardcode user
  const [summaries, setSummaries] = useState<Summary[]>([])
  const [latestSummary, setLatestSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummaries()
    fetchLatestSummary()
  }, [])

  const fetchSummaries = async () => {
    try {
      const response = await axios.get(`/api/summaries/${userId}`)
      setSummaries(response.data)
    } catch (error) {
      console.error('Error fetching summaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLatestSummary = async () => {
    try {
      const response = await axios.get(`/api/summaries/${userId}/latest`)
      setLatestSummary(response.data)
    } catch (error) {
      // Latest summary might not exist yet
      console.log('No latest summary found')
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl">Loading summaries...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Weekly Summaries</h1>

          {/* Latest Summary */}
          {latestSummary && (
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6 mb-4">
                <h2 className="text-xl font-semibold mb-2">Latest Summary</h2>
                <p className="text-sm opacity-90">
                  {format(new Date(latestSummary.weekStartDate), 'MMM d')} -{' '}
                  {format(new Date(latestSummary.weekEndDate), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {latestSummary.summaryText}
                </p>
              </div>
            </div>
          )}

          {/* All Summaries */}
          {summaries.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No weekly summaries yet.</p>
              <p className="text-sm text-gray-500 mb-4">
                Summaries are automatically generated every Sunday. Check back soon!
              </p>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-4">All Summaries</h2>
              <div className="space-y-6">
                {summaries.map((summary) => (
                  <div
                    key={summary.id}
                    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Week of {format(new Date(summary.weekStartDate), 'MMM d')} -{' '}
                        {format(new Date(summary.weekEndDate), 'MMM d, yyyy')}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {format(new Date(summary.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {summary.summaryText}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}