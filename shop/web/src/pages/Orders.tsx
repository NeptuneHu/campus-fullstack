import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { STATUSES, formatDate, yuan, type Order } from '../types'

export default function Orders() {
  const [status, setStatus] = useState('')
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    client.get('/orders', { params: { status } }).then((res) => setOrders(res.data.orders))
  }, [status])

  return (
    <div>
      <h1 className="text-3xl font-semibold">我的订单</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => setStatus('')} className={`rounded-full px-3 py-1 text-sm ${status === '' ? 'bg-stone-900 text-white' : 'bg-white ring-1 ring-stone-200'}`}>全部</button>
        {STATUSES.map((item) => (
          <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-full px-3 py-1 text-sm ${status === item ? 'bg-stone-900 text-white' : 'bg-white ring-1 ring-stone-200'}`}>{item}</button>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {orders.length === 0 && <p className="rounded-3xl bg-white p-8 text-stone-500 ring-1 ring-stone-200">这个状态下还没有订单。</p>}
        {orders.map((order) => (
          <Link key={order.id} to={`/orders/${order.id}`} className="block rounded-3xl bg-white p-4 ring-1 ring-stone-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone-500">{order.order_no}</span>
              <span className={order.status === '待支付' ? 'text-amber-800' : 'text-stone-600'}>{order.status}</span>
            </div>
            <p className="mt-2">{order.items.map((item) => `${item.name} × ${item.quantity}`).join('、')}</p>
            <p className="mt-2 text-sm text-stone-500">{formatDate(order.created_at)} · {yuan(order.total_price)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
