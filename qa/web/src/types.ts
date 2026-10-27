export type User = {
  id: number
  username: string
  email: string
  avatar: string
  points: number
  created_at?: string
}

export type Question = {
  id: number
  title: string
  content: string
  tags: string[]
  author_id: number
  author_name: string
  author_points?: number
  views: number
  answers_count: number
  votes: number
  is_solved: boolean
  voted: boolean
  created_at: string
}

export type Answer = {
  id: number
  content: string
  question_id: number
  author_id: number
  author_name: string
  author_points: number
  votes: number
  is_accepted: boolean
  voted: boolean
  created_at: string
}

export const TAGS = ['前端', '数据库', '课程']

export function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
}

export function errorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
    if (message) return message
  }
  return fallback
}
