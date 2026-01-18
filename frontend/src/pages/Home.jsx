import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPresetCompleted, setPresetCompleted, formatDueDate } from '../utils/goalsStorage'
import '../App.css'

function getPresetDueDate(daysFromNow) {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    return d.toISOString().slice(0, 10)
}

const PRESETS = [
    { id: 'academics', goalName: 'Ace my finals', focusArea: 'Academics', dueDate: getPresetDueDate(14) },
    { id: 'gymming', goalName: 'Build a consistent workout routine', focusArea: 'Gymming', dueDate: getPresetDueDate(28) },
    { id: 'personalGrowth', goalName: 'Read 2 books this month', focusArea: 'Personal Growth', dueDate: getPresetDueDate(21) }
]

function Home() {
    const navigate = useNavigate()
    const [presetCompleted, setPresetCompletedState] = useState({})

    useEffect(() => {
        setPresetCompletedState(getPresetCompleted())
    }, [])

    const handleFinishEarly = (id) => {
        setPresetCompleted(id)
        setPresetCompletedState(getPresetCompleted())
    }

    return (
        <div className="background">
            <div className="home-container">
                <h1>HowUBeen</h1>
                <p className="subtitle">A digital log of your goals</p>

                <h2 className="presets-heading">Example goals</h2>
                <ul className="preset-list">
                    {PRESETS.map((p) => (
                        <li key={p.id} className={`goal-card preset-card ${presetCompleted[p.id] ? 'goal-card--completed' : ''}`}>
                            <div className="goal-card-main">
                                <span className="goal-name">{p.goalName}</span>
                                <span className="goal-focus">{p.focusArea}</span>
                                <span className="goal-due">Due: {formatDueDate(p.dueDate)}</span>
                            </div>
                            {presetCompleted[p.id] ? (
                                <span className="goal-completed-badge">Completed</span>
                            ) : (
                                <button
                                    type="button"
                                    className="finish-early-btn"
                                    onClick={() => handleFinishEarly(p.id)}
                                >
                                    Finish early
                                </button>
                            )}
                        </li>
                    ))}
                </ul>

                <div className="home-actions">
                    <button className="get-started-btn" onClick={() => navigate('/login')}>
                        Log in
                    </button>
                    <button className="get-started-btn secondary-btn" onClick={() => navigate('/signup')}>
                        Sign up
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Home
