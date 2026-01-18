import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
    getGoals,
    deleteGoal,
    completeGoal,
    formatDueDate,
    ensureStarterGoals,
    getMonthlyCheckinCount,
    recordCheckin,
    addDailyGoal,
    toggleDailyGoal,
    deleteDailyGoal,
    shouldGenerateWeeklySummary,
    generateWeeklySummaryData,
    saveWeeklySummary,
    getWeeklySummaries
} from '../utils/goalsStorage'
import '../App.css'

function Profile() {
    const navigate = useNavigate()
    const location = useLocation()
    const userName = location.state?.name || 'User'
    const [goals, setGoals] = useState([])
    const [checkinCount, setCheckinCount] = useState(0)
    const [newDailyGoal, setNewDailyGoal] = useState({})
    const [weeklySummaries, setWeeklySummaries] = useState([])

    useEffect(() => {
        ensureStarterGoals()
        recordCheckin() // Record today's check-in
        setGoals(getGoals())
        setCheckinCount(getMonthlyCheckinCount())
        setWeeklySummaries(getWeeklySummaries())

        // Check if we should generate a weekly summary
        if (shouldGenerateWeeklySummary()) {
            const summaryData = generateWeeklySummaryData()
            saveWeeklySummary(summaryData)
            setWeeklySummaries(getWeeklySummaries())
        }
    }, [])

    const handleDelete = (id) => {
        deleteGoal(id)
        setGoals(getGoals())
    }

    const handleFinishEarly = (id) => {
        completeGoal(id)
        setGoals(getGoals())
    }

    const handleAddDailyGoal = (goalId) => {
        const text = newDailyGoal[goalId]
        if (text && text.trim()) {
            addDailyGoal(goalId, text.trim())
            setNewDailyGoal({ ...newDailyGoal, [goalId]: '' })
            setGoals(getGoals())
        }
    }

    const handleToggleDailyGoal = (goalId, dailyGoalId) => {
        toggleDailyGoal(goalId, dailyGoalId)
        setGoals(getGoals())
    }

    const handleDeleteDailyGoal = (goalId, dailyGoalId) => {
        deleteDailyGoal(goalId, dailyGoalId)
        setGoals(getGoals())
    }

    return (
        <div className="background">
            <div className="profile-container">
                <h1>Welcome, {userName}!</h1>
                <div className="profile-content">
                    <p>You've Checked In {checkinCount} times this month!
                    </p>

                    {weeklySummaries.length > 0 && (
                        <div className="weekly-summary-section">
                            <h2 className="goals-heading">Weekly Summary</h2>
                            <div className="weekly-summary">
                                <div className="summary-item">
                                    <strong>✅ What went well:</strong> {weeklySummaries[0].wentWell}
                                </div>
                                <div className="summary-item">
                                    <strong>⚠️ What slipped:</strong> {weeklySummaries[0].slipped}
                                </div>
                                <div className="summary-item">
                                    <strong>📊 Patterns:</strong> {weeklySummaries[0].patterns}
                                </div>
                            </div>
                        </div>
                    )}

                    <h2 className="goals-heading">Your Goals</h2>
                    {goals.length === 0 ? (
                        <p className="goals-empty">No goals yet. Create one!</p>
                    ) : (
                        <ul className="goals-list">
                            {goals.map((goal) => (
                                <li
                                    key={goal.id}
                                    className={`goal-card ${goal.completedAt ? 'goal-card--completed' : ''}`}
                                >
                                    <div className="goal-card-main">
                                        <span className="goal-name">{goal.goalName}</span>
                                        <span className="goal-focus">{goal.focusArea}</span>
                                        {goal.dueDate && (
                                            <span className="goal-due">
                                                Due: {formatDueDate(goal.dueDate)}
                                            </span>
                                        )}
                                    </div>
                                    {goal.description && (
                                        <p className="goal-description">{goal.description}</p>
                                    )}

                                    {/* Daily Goals Section */}
                                    {!goal.completedAt && (
                                        <div className="daily-goals-section">
                                            <div className="daily-goals-header">Daily Goals:</div>
                                            {goal.dailyGoals && goal.dailyGoals.length > 0 && (
                                                <ul className="daily-goals-list">
                                                    {goal.dailyGoals.map((dg) => (
                                                        <li key={dg.id} className="daily-goal-item">
                                                            <input
                                                                type="checkbox"
                                                                checked={dg.completed}
                                                                onChange={() => handleToggleDailyGoal(goal.id, dg.id)}
                                                                className="daily-goal-checkbox"
                                                            />
                                                            <span className={dg.completed ? 'daily-goal-completed' : ''}>
                                                                {dg.text}
                                                            </span>
                                                            <button
                                                                className="daily-goal-delete"
                                                                onClick={() => handleDeleteDailyGoal(goal.id, dg.id)}
                                                            >
                                                                ×
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                            <div className="add-daily-goal">
                                                <input
                                                    type="text"
                                                    placeholder="Add a daily goal..."
                                                    value={newDailyGoal[goal.id] || ''}
                                                    onChange={(e) => setNewDailyGoal({ ...newDailyGoal, [goal.id]: e.target.value })}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddDailyGoal(goal.id)
                                                        }
                                                    }}
                                                    className="daily-goal-input"
                                                />
                                                <button
                                                    onClick={() => handleAddDailyGoal(goal.id)}
                                                    className="add-daily-goal-btn"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {goal.completedAt ? (
                                        <span className="goal-completed-badge">Completed</span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="finish-early-btn"
                                            onClick={() => handleFinishEarly(goal.id)}
                                        >
                                            Finish early
                                        </button>
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

