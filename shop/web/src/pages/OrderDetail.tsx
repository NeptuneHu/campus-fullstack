import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import client from '../api/client'
import { errorMessage, formatDate, yuan, type Order } from '../types'

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    client.get(`/orders/${id}`).then((res) => setOrder(res.data.order)).catch((err) => setError(errorMessage(err, '订单不存在')))
  }, [id])

  async function cancel() {
    if (!window.confirm('取消后库存会加回去。确定取消这笔待支付订单？')) return
    const res = await client.put(`/orders/${id}/cancel`)
    setOrder(res.data.order)
  }

  if (error) return <p className="text-red-700">{error}</p>
  if (!order) return <p className="text-stone-500">正在打开订单…</p>

  return (
    <article className="rounded-3xl bg-white p-6 ring-1 ring-stone-200">
      <p className="text-sm text-stone-500">订单号 {order.order_no}</p>
      <h1 className="mt-1 text-3xl font-semibold">{order.status}</h1>
      <p className="mt-2 text-sm text-stone-500">{formatDate(order.created_at)} · 练习环境不接入支付</p>
      <div className="mt-6 space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.name} × {item.quantity}</span>
            <span>{yuan(item.price)} / 件</span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-lg">合计 {yuan(order.total_price)}</p>
      <div className="mt-6 rounded-2xl bg-stone-50 p-4 text-sm leading-6">
        <p>{order.receiver} {order.phone}</p>
        <p>{order.province}{order.city}{order.district} {order.detail}</p>
      </div>
      {order.status === '待支付' && (
        <button type="button" onClick={cancel} className="mt-5 rounded-full px-4 py-2 text-sm text-red-700 ring-1 ring-red-200">取消订单</button>
      )}
    </article>
  )
}
