import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getGoals, deleteGoal } from '../utils/goalsStorage'
import '../App.css'

function Profile() {
  const navigate = useNavigate()
  const location = useLocation()
  const userName = location.state?.name || 'User'
  const [goals, setGoals] = useState([])

  useEffect(() => {
    setGoals(getGoals())
  }, [])

  const handleDelete = (id) => {
    deleteGoal(id)
    setGoals(getGoals())
  }

  return (
    <div className="background">
      <div className="profile-container">
        <h1>Welcome, {userName}!</h1>
        <div className="profile-content">
          <p>This is your profile page.</p>
          <h2 className="goals-heading">Your Goals</h2>
          {goals.length === 0 ? (
            <p className="goals-empty">No goals yet. Create one!</p>
          ) : (
            <ul className="goals-list">
              {goals.map((goal) => (
                <li key={goal.id} className="goal-card">
                  <div className="goal-card-main">
                    <span className="goal-name">{goal.goalName}</span>
                    <span className="goal-focus">{goal.focusArea}</span>
                  </div>
                  {goal.description && (
                    <p className="goal-description">{goal.description}</p>
                  )}
                  <button
                    type="button"
                    className="goal-delete"
                    onClick={() => handleDelete(goal.id)}
                    aria-label="Delete goal"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="profile-actions">
          <button
            className="get-started-btn"
            onClick={() => navigate('/make-goal')}
          >
            Make Goal
          </button>
          <button
            className="get-started-btn secondary-btn"
            onClick={() => navigate('/')}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
