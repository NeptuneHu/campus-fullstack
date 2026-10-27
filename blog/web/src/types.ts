export type User = {
  id: number
  username: string
  email: string
  avatar: string
  created_at?: string
}

export type Post = {
  id: number
  title: string
  content: string
  cover: string
  category: string
  tags: string[]
  author_id: number
  author_name: string
  author_avatar: string
  views: number
  created_at: string
  updated_at: string
}

export type Category = {
  id: number
  name: string
  description: string
}

export function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })
}

export function excerpt(content: string) {
  return content.replace(/[#>*`]/g, '').replace(/\s+/g, ' ').trim().slice(0, 78)
}

export function errorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
    if (message) return message
  }
  return fallback
}

export const tones: Record<string, string> = {
  技术: 'from-orange-900 to-stone-800',
  生活: 'from-stone-600 to-stone-800',
  读书: 'from-amber-800 to-orange-950',
  随记: 'from-stone-500 to-stone-700',
}
