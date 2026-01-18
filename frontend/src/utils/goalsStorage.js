const STORAGE_KEY = 'howubeen_goals'
const PRESET_COMPLETED_KEY = 'howubeen_preset_completed'
const STARTER_GOALS_ADDED_KEY = 'howubeen_starter_goals_added'
const CHECKINS_KEY = 'howubeen_checkins'
const WEEKLY_SUMMARIES_KEY = 'howubeen_weekly_summaries'

function getStarterGoals() {
    const now = Date.now()
    const due = (days) => {
        const d = new Date(now)
        d.setDate(d.getDate() + days)
        return d.toISOString().slice(0, 10)
    }
    return [
        { id: 'starter-academics', goalName: 'Ace my finals', focusArea: 'Academics', dueDate: due(14), createdAt: now },
        { id: 'starter-gymming', goalName: 'Build a consistent workout routine', focusArea: 'Gymming', dueDate: due(28), createdAt: now },
        { id: 'starter-personal-growth', goalName: 'Read 2 books this month', focusArea: 'Personal Growth', dueDate: due(21), createdAt: now }
    ]
}

export function ensureStarterGoals() {
    if (localStorage.getItem(STARTER_GOALS_ADDED_KEY)) return
    const existing = getGoals()
    if (existing.length === 0) {
        const starters = getStarterGoals()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(starters))
    }
    localStorage.setItem(STARTER_GOALS_ADDED_KEY, 'true') // only add starters when empty; flag prevents re-running
}

export function getGoals() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    } catch {
        return []
    }
}

export function saveGoal(goal) {
    const goals = getGoals()
    const newGoal = {
        id: Date.now(),
        ...goal,
        createdAt: Date.now()
    }
    goals.unshift(newGoal)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    return newGoal
}

export function deleteGoal(id) {
    const goals = getGoals().filter((g) => g.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
}

export function completeGoal(id) {
    const goals = getGoals()
    const goal = goals.find((g) => g.id === id)
    if (goal) {
        goal.completedAt = Date.now()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    }
}

export function getPresetCompleted() {
    try {
        return JSON.parse(localStorage.getItem(PRESET_COMPLETED_KEY) || '{}')
    } catch {
        return {}
    }
}

export function setPresetCompleted(id) {
    const completed = getPresetCompleted()
    completed[id] = Date.now()
    localStorage.setItem(PRESET_COMPLETED_KEY, JSON.stringify(completed))
}

export function formatDueDate(isoDate) {
    if (!isoDate) return null
    return new Date(isoDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    })
}

// Check-in tracking functions
export function recordCheckin() {
    const checkins = getCheckins()
    const today = new Date().toISOString().slice(0, 10)
    if (!checkins.includes(today)) {
        checkins.push(today)
        localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkins))
    }
}

export function getCheckins() {
    try {
        return JSON.parse(localStorage.getItem(CHECKINS_KEY) || '[]')
    } catch {
        return []
    }
}

export function getMonthlyCheckinCount() {
    const checkins = getCheckins()
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    return checkins.filter(dateStr => {
        const date = new Date(dateStr)
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }).length
}

// Daily goals functions
export function addDailyGoal(goalId, dailyGoalText) {
    const goals = getGoals()
    const goal = goals.find(g => g.id === goalId)
    if (goal) {
        if (!goal.dailyGoals) goal.dailyGoals = []
        goal.dailyGoals.push({
            id: Date.now(),
            text: dailyGoalText,
            completed: false,
            createdAt: Date.now()
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    }
}

export function toggleDailyGoal(goalId, dailyGoalId) {
    const goals = getGoals()
    const goal = goals.find(g => g.id === goalId)
    if (goal && goal.dailyGoals) {
        const dailyGoal = goal.dailyGoals.find(dg => dg.id === dailyGoalId)
        if (dailyGoal) {
            dailyGoal.completed = !dailyGoal.completed
            localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
        }
    }
}

export function deleteDailyGoal(goalId, dailyGoalId) {
    const goals = getGoals()
    const goal = goals.find(g => g.id === goalId)
    if (goal && goal.dailyGoals) {
        goal.dailyGoals = goal.dailyGoals.filter(dg => dg.id !== dailyGoalId)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    }
}

// Weekly summary functions
export function saveWeeklySummary(summary) {
    const summaries = getWeeklySummaries()
    const newSummary = {
        id: Date.now(),
        weekStart: getWeekStart(),
        weekEnd: new Date().toISOString().slice(0, 10),
        ...summary,
        createdAt: Date.now()
    }
    summaries.unshift(newSummary)
    localStorage.setItem(WEEKLY_SUMMARIES_KEY, JSON.stringify(summaries))
    return newSummary
}

export function getWeeklySummaries() {
    try {
        return JSON.parse(localStorage.getItem(WEEKLY_SUMMARIES_KEY) || '[]')
    } catch {
        return []
    }
}

export function getWeekStart() {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day
    const weekStart = new Date(now.setDate(diff))
    return weekStart.toISOString().slice(0, 10)
}

export function shouldGenerateWeeklySummary() {
    const summaries = getWeeklySummaries()
    const currentWeekStart = getWeekStart()

    // Check if we already have a summary for this week
    const hasCurrentWeekSummary = summaries.some(s => s.weekStart === currentWeekStart)

    // Check if it's Sunday (end of week)
    const today = new Date()
    const isSunday = today.getDay() === 0

    return isSunday && !hasCurrentWeekSummary
}

export function generateWeeklySummaryData() {
    const checkins = getCheckins()
    const weekStart = getWeekStart()
    const weekStartDate = new Date(weekStart)
    const today = new Date()

    // Get check-ins from this week
    const weekCheckins = checkins.filter(dateStr => {
        const date = new Date(dateStr)
        return date >= weekStartDate && date <= today
    })

    const goals = getGoals()
    const completedThisWeek = goals.filter(g => {
        if (!g.completedAt) return false
        const completedDate = new Date(g.completedAt)
        return completedDate >= weekStartDate && completedDate <= today
    })

    // Calculate daily goal completion
    let totalDailyGoals = 0
    let completedDailyGoals = 0
    goals.forEach(g => {
        if (g.dailyGoals) {
            totalDailyGoals += g.dailyGoals.length
            completedDailyGoals += g.dailyGoals.filter(dg => dg.completed).length
        }
    })

    return {
        checkinsCount: weekCheckins.length,
        goalsCompleted: completedThisWeek.length,
        dailyGoalsCompleted: completedDailyGoals,
        totalDailyGoals: totalDailyGoals,
        wentWell: weekCheckins.length >= 5 ? 'Consistent check-ins throughout the week' : 'Maintained awareness of goals',
        slipped: weekCheckins.length < 3 ? 'Check-in frequency could be improved' : 'Could focus more on daily goal completion',
        patterns: `Checked in ${weekCheckins.length} times this week. ${completedThisWeek.length > 0 ? `Completed ${completedThisWeek.length} major goal(s).` : 'Focus on completing goals.'}`
    }
}

