import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveGoal } from '../utils/goalsStorage'
import '../App.css'

function MakeGoal() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    goalName: '',
    focusArea: 'Personal Growth',
    description: ''
  })

  const focusOptions = ['Academics', 'Athletics', 'Social', 'Personal Growth']

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveGoal({
      goalName: formData.goalName,
      focusArea: formData.focusArea,
      description: formData.description
    })
    navigate('/profile')
  }

  return (
    <div className="background">
      <div className="form-container">
        <h1>Make a Goal</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="goalName">Goal name</label>
            <input
              type="text"
              id="goalName"
              name="goalName"
              value={formData.goalName}
              onChange={handleChange}
              placeholder="e.g. Finish semester strong"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="focusArea">Focus area</label>
            <select
              id="focusArea"
              name="focusArea"
              value={formData.focusArea}
              onChange={handleChange}
              className="form-select"
            >
              {focusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What does this goal mean to you?"
            />
          </div>
          <button type="submit" className="get-started-btn">Create Goal</button>
          <button
            type="button"
            className="get-started-btn secondary-btn"
            onClick={() => navigate('/profile')}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  )
}

export default MakeGoal
