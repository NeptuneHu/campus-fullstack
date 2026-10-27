import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { errorMessage, yuan, type CartItem } from '../types'

export default function Cart() {
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [error, setError] = useState('')

  function load() {
    return client.get('/cart').then((res) => {
      setItems(res.data.items)
      setTotal(res.data.total_price)
    })
  }

  useEffect(() => {
    load()
  }, [])

  async function change(id: number, quantity: number) {
    setError('')
    try {
      const res = await client.put(`/cart/${id}`, { quantity })
      setItems(res.data.items)
      setTotal(res.data.total_price)
    } catch (err) {
      setError(errorMessage(err, '数量没有改成'))
    }
  }

  async function remove(id: number) {
    await client.delete(`/cart/${id}`)
    await load()
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold">购物车</h1>
      <p className="mt-2 text-sm text-stone-500">同一件商品再加入时，数量会累加，并且不能超过库存。</p>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 space-y-3">
        {items.length === 0 && <p className="rounded-3xl bg-white p-8 text-stone-500 ring-1 ring-stone-200">购物车是空的。</p>}
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-4 rounded-3xl bg-white p-4 ring-1 ring-stone-200">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="mt-1 text-sm text-stone-500">{item.category} · 库存 {item.stock} · {yuan(item.price)}</p>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <input type="number" min={1} value={item.quantity} onChange={(e) => change(item.id, Number(e.target.value))} className="w-20 rounded-xl border border-stone-200 px-2 py-1" />
              <span className="w-20 text-right text-sm">{yuan(item.line_total)}</span>
              <button type="button" onClick={() => remove(item.id)} className="text-sm text-red-700">移除</button>
            </div>
          </div>
        ))}
      </div>
      {items.length > 0 && (
        <div className="mt-6 flex items-center justify-end gap-4">
          <p className="text-lg">合计 {yuan(total)}</p>
          <Link to="/checkout" className="rounded-full bg-amber-800 px-5 py-2 text-sm text-white">去结算</Link>
        </div>
      )}
    </div>
  )
}
