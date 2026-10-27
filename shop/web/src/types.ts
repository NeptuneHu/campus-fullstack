export type User = {
  id: number
  username: string
  email: string
  avatar: string
}

export type Product = {
  id: number
  name: string
  description: string
  price: number
  stock: number
  category: string
  images: string[]
}

export type CartItem = {
  id: number
  product_id: number
  name: string
  category: string
  price: number
  stock: number
  quantity: number
  line_total: number
}

export type Address = {
  id: number
  name: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  is_default: number
}

export type OrderItem = {
  id: number
  order_id: number
  product_id: number
  name: string
  category: string
  quantity: number
  price: number
}

export type Order = {
  id: number
  order_no: string
  total_price: number
  status: string
  created_at: string
  items: OrderItem[]
  receiver?: string
  phone?: string
  province?: string
  city?: string
  district?: string
  detail?: string
}

export const CATEGORIES = ['文具', '数码', '零食', '生活']
export const STATUSES = ['待支付', '已支付', '已发货', '已完成', '已取消']

export const tones: Record<string, string> = {
  文具: 'from-amber-800 to-orange-950',
  数码: 'from-stone-700 to-stone-900',
  零食: 'from-orange-700 to-amber-900',
  生活: 'from-stone-500 to-stone-700',
}

export function yuan(value: number) {
  return `¥${Number(value).toFixed(2)}`
}

export function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', { hour12: false, month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function errorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error && 'response' in error) {
    const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message
    if (message) return message
  }
  return fallback
}
