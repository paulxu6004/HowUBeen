const STORAGE_KEY = 'howubeen_goals'

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
