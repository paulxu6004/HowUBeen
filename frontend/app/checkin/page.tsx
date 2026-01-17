'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

/**
 * Daily Check-in Page
 * Supports text input or voice recording (max 30 seconds)
 * Optional emoji mood selection
 */
export default function CheckIn() {
  const router = useRouter()
  const [userId] = useState('user1') // In MVP, hardcode user
  const [textInput, setTextInput] = useState('')
  const [emoji, setEmoji] = useState<string | null>(null)
  const [inputType, setInputType] = useState<'text' | 'voice'>('text')
  const [recording, setRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const emojis = [
    { value: '😞', label: 'Down' },
    { value: '😐', label: 'Neutral' },
    { value: '🙂', label: 'Happy' }
  ]

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(audioBlob)
        const url = URL.createObjectURL(audioBlob)
        setAudioUrl(url)
        setInputType('voice')
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setRecording(true)

      // Auto-stop after 30 seconds (max)
      setTimeout(() => {
        if (recording) {
          stopRecording()
        }
      }, 30000)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Failed to access microphone. Please check permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop()
      setRecording(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!textInput && !audioBlob) {
      alert('Please provide either text input or record a voice note')
      return
    }

    setLoading(true)

    try {
      const today = new Date().toISOString().split('T')[0]
      const formData = new FormData()
      
      formData.append('userId', userId)
      formData.append('date', today)
      formData.append('textInput', textInput)
      if (emoji) {
        formData.append('emoji', emoji)
      }
      if (audioBlob) {
        formData.append('voiceNote', audioBlob, 'voice-note.webm')
      }

      const response = await axios.post('/api/checkins', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      alert('Check-in submitted successfully!')
      
      // Reset form
      setTextInput('')
      setEmoji(null)
      setAudioBlob(null)
      setAudioUrl(null)
      setInputType('text')
      setRecording(false)
      
      router.push('/timeline')
    } catch (error) {
      console.error('Error submitting check-in:', error)
      alert('Failed to submit check-in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">Daily Check-in</h1>
          <p className="text-gray-600 mb-6">Share how your day went - use text or voice (max 30 seconds)</p>

          <form onSubmit={handleSubmit}>
            {/* Input Type Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">Input Type</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setInputType('text')
                    setAudioBlob(null)
                    setAudioUrl(null)
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    inputType === 'text'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ✍️ Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputType('voice')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    inputType === 'voice'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🎤 Voice
                </button>
              </div>
            </div>

            {/* Text Input */}
            {inputType === 'text' && (
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  How did your day go? *
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Share your thoughts, experiences, or progress..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                  required={!audioBlob}
                />
              </div>
            )}

            {/* Voice Recording */}
            {inputType === 'voice' && (
              <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">
                  Record Voice Note (Max 30 seconds)
                </label>
                <div className="flex items-center gap-4">
                  {!recording && !audioBlob && (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    >
                      🎤 Start Recording
                    </button>
                  )}
                  {recording && (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      ⏹️ Stop Recording
                    </button>
                  )}
                  {recording && (
                    <span className="text-red-600 font-medium">● Recording...</span>
                  )}
                </div>
                
                {audioUrl && (
                  <div className="mt-4">
                    <audio src={audioUrl} controls className="w-full" />
                    <button
                      type="button"
                      onClick={() => {
                        setAudioBlob(null)
                        setAudioUrl(null)
                      }}
                      className="mt-2 text-sm text-red-600 hover:underline"
                    >
                      Remove recording
                    </button>
                  </div>
                )}

                {/* Optional text input even with voice */}
                <div className="mt-4">
                  <label className="block text-gray-700 font-medium mb-2 text-sm">
                    Additional notes (optional)
                  </label>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Add any additional context..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Emoji Selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-semibold mb-2">
                How are you feeling? (Optional)
              </label>
              <div className="flex gap-4">
                {emojis.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setEmoji(emoji === item.value ? null : item.value)}
                    className={`text-4xl px-4 py-2 rounded-lg transition-all ${
                      emoji === item.value
                        ? 'bg-blue-100 ring-2 ring-blue-500'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {item.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!textInput && !audioBlob)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Submitting...' : 'Submit Check-in'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}