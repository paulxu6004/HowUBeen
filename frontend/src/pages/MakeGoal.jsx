import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../App.css'

function MakeGoal() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        goalName: '',
        focusArea: 'Personal Growth',
        description: '',
        dueDate: ''
    })

    const focusOptions = ['Academics', 'Athletics', 'Gymming', 'Social', 'Personal Growth']

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { default: client } = await import('../api/client')
            const userId = localStorage.getItem('user_id')

            // 1. Get Active Period
            let currentGoals = []
            let startDate = new Date().toISOString().slice(0, 10)
            let endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

            try {
                const activeRes = await client.get(`/periods/${userId}/active`)
                if (activeRes.data) {
                    if (activeRes.data.goals) {
                        currentGoals = JSON.parse(activeRes.data.goals)
                    }
                    startDate = activeRes.data.start_date
                    endDate = activeRes.data.end_date
                }
            } catch (err) {
                console.log('No active period, creating new one')
            }

            // 2. Add New Goal
            const newGoal = {
                id: Date.now(),
                goalName: formData.goalName,
                focusArea: formData.focusArea,
                description: formData.description,
                dueDate: formData.dueDate || null,
                createdAt: Date.now(),
                dailyGoals: []
            }
            currentGoals.unshift(newGoal)

            // 3. Save (Create new period revision)
            await client.post('/periods', {
                user_id: userId,
                start_date: startDate,
                end_date: endDate,
                goals: currentGoals
            })

            navigate('/profile')
        } catch (err) {
            console.error('Failed to create goal:', err)
            alert('Failed to save goal. Please try again.')
        }
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
                        <label htmlFor="dueDate">Due date</label>
                        <input
                            type="date"
                            id="dueDate"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                        />
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
