const STORAGE_KEY = 'howubeen_goals'
const PRESET_COMPLETED_KEY = 'howubeen_preset_completed'
const STARTER_GOALS_ADDED_KEY = 'howubeen_starter_goals_added'

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
