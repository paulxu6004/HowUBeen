'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { format } from 'date-fns'

/**
 * Timeline Page
 * Displays all check-ins with moods, focus areas, and AI labels
 */
interface CheckIn {
  id: number
  date: string
  rawInput: string
  inputType: string
  emoji: string | null
  mood: string | null
  focusArea: string | null
  alignment: string | null
  takeaway: string | null
  voiceFilePath: string | null
}

export default function Timeline() {
  const [userId] = useState('user1') // In MVP, hardcode user
  const [checkins, setCheckins] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCheckins()
  }, [])

  const fetchCheckins = async () => {
    try {
      const response = await axios.get(`/api/checkins/${userId}`)
      setCheckins(response.data)
    } catch (error) {
      console.error('Error fetching check-ins:', error)
      alert('Failed to load check-ins')
    } finally {
      setLoading(false)
    }
  }

  const getAlignmentColor = (alignment: string | null) => {
    if (!alignment) return 'bg-gray-200 text-gray-700'
    if (alignment === 'On track') return 'bg-green-100 text-green-700'
    if (alignment === 'Off track') return 'bg-red-100 text-red-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  const getMoodEmoji = (mood: string | null, emoji: string | null) => {
    return mood || emoji || '😐'
  }

  if (loading) {
    return (
      <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xl">Loading timeline...</p>
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
          <h1 className="text-3xl font-bold mb-6">Check-in Timeline</h1>

          {checkins.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No check-ins yet.</p>
              <Link href="/checkin" className="text-blue-600 hover:underline">
                Create your first check-in →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {checkins.map((checkin) => (
                <div
                  key={checkin.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format(new Date(checkin.date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="text-3xl">
                      {getMoodEmoji(checkin.mood, checkin.emoji)}
                    </div>
                  </div>

                  {/* Check-in Content */}
                  <div className="mb-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {checkin.rawInput || 'No content'}
                    </p>
                    {checkin.inputType === 'voice' && (
                      <span className="inline-block mt-2 text-sm text-blue-600">
                        🎤 Voice note
                      </span>
                    )}
                  </div>

                  {/* AI Labels */}
                  {(checkin.focusArea || checkin.alignment || checkin.takeaway) && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        {checkin.focusArea && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">Focus Area:</span>
                            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {checkin.focusArea}
                            </span>
                          </div>
                        )}
                        {checkin.alignment && (
                          <div>
                            <span className="text-sm font-semibold text-gray-600">Alignment:</span>
                            <span className={`ml-2 text-sm px-2 py-1 rounded ${getAlignmentColor(checkin.alignment)}`}>
                              {checkin.alignment}
                            </span>
                          </div>
                        )}
                      </div>
                      {checkin.takeaway && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-2">
                          <p className="text-sm font-medium text-gray-700">💡 Takeaway:</p>
                          <p className="text-sm text-gray-600 mt-1">{checkin.takeaway}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}