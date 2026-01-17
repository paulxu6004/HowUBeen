'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

/**
 * Create Period Page
 * Allows users to create a new life period with focus areas
 * Shows an example period as reference
 */
export default function CreatePeriod() {
  const router = useRouter()
  const [userId] = useState('user1') // In MVP, hardcode user
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [descriptions, setDescriptions] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)

  const availableFocusAreas = ['Academics', 'Athletics', 'Social', 'Personal Growth']

  const toggleFocusArea = (area: string) => {
    if (focusAreas.includes(area)) {
      setFocusAreas(focusAreas.filter(a => a !== area))
      const newDescriptions = { ...descriptions }
      delete newDescriptions[area]
      setDescriptions(newDescriptions)
    } else {
      if (focusAreas.length < 3) {
        setFocusAreas([...focusAreas, area])
        setDescriptions({ ...descriptions, [area]: '' })
      } else {
        alert('Maximum 3 focus areas allowed')
      }
    }
  }

  const handleDescriptionChange = (area: string, value: string) => {
    setDescriptions({ ...descriptions, [area]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !startDate || !endDate || focusAreas.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await axios.post('/api/periods', {
        userId,
        name,
        startDate,
        endDate,
        focusAreas,
        descriptions: focusAreas.map(area => descriptions[area] || '')
      })

      alert('Period created successfully!')
      router.push('/')
    } catch (error) {
      console.error('Error creating period:', error)
      alert('Failed to create period')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Create Life Period</h1>

          {/* Example Period Reference */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">📋 Example Period:</h3>
            <div className="text-sm text-blue-800">
              <p><strong>Name:</strong> "Fall 2024 Semester"</p>
              <p><strong>Dates:</strong> Sept 1 - Dec 15, 2024</p>
              <p><strong>Focus Areas:</strong> Academics (Maintain 3.8 GPA), Athletics (Train for marathon), Personal Growth (Daily meditation)</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Period Name */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Period Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Fall 2024 Semester"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Focus Areas */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                Focus Areas * (Select up to 3)
              </label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {availableFocusAreas.map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleFocusArea(area)}
                    className={`px-4 py-3 border-2 rounded-lg font-medium transition-colors ${
                      focusAreas.includes(area)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>

              {/* Descriptions for selected focus areas */}
              {focusAreas.map((area) => (
                <div key={area} className="mb-4">
                  <label className="block text-gray-700 font-semibold mb-2">
                    {area} Description (Optional)
                  </label>
                  <textarea
                    value={descriptions[area] || ''}
                    onChange={(e) => handleDescriptionChange(area, e.target.value)}
                    placeholder={`e.g., Maintain 3.8 GPA, complete all assignments on time`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                  />
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Period'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}