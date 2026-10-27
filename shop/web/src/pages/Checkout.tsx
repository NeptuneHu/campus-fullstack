import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { errorMessage, yuan, type Address, type CartItem } from '../types'

export default function Checkout() {
  const navigate = useNavigate()
  const [items, setItems] = useState<CartItem[]>([])
  const [selected, setSelected] = useState<number[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [addressId, setAddressId] = useState(0)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    client.get('/cart').then((res) => {
      setItems(res.data.items)
      setSelected(res.data.items.map((item: CartItem) => item.id))
    })
    client.get('/addresses').then((res) => {
      setAddresses(res.data.addresses)
      const preferred = res.data.addresses.find((item: Address) => item.is_default) || res.data.addresses[0]
      if (preferred) setAddressId(preferred.id)
    })
  }, [])

  const chosen = items.filter((item) => selected.includes(item.id))
  const total = chosen.reduce((sum, item) => sum + Number(item.line_total), 0)

  function toggle(id: number) {
    setSelected((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      const res = await client.post('/orders', { address_id: addressId, cart_item_ids: selected })
      navigate(`/orders/${res.data.order.id}`)
    } catch (err) {
      setError(errorMessage(err, '下单失败'))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1 className="text-3xl font-semibold">确认订单</h1>
      <p className="mt-2 text-sm text-stone-500">订单会记下现在的价格。创建后状态是待支付。</p>
      <div className="mt-5 grid gap-4 md:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-3">
          {items.map((item) => (
            <label key={item.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
              <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} />
              <span className="flex-1">{item.name} × {item.quantity}</span>
              <span>{yuan(item.line_total)}</span>
            </label>
          ))}
          {items.length === 0 && <p className="text-stone-500">购物车是空的。</p>}
        </div>
        <div className="rounded-3xl bg-white p-5 ring-1 ring-stone-200">
          <h2 className="font-medium">收货地址</h2>
          {addresses.length === 0 && <p className="mt-3 text-sm text-stone-500">还没有地址。<Link to="/addresses" className="text-amber-800">去添加</Link></p>}
          <div className="mt-3 space-y-2">
            {addresses.map((address) => (
              <label key={address.id} className="block rounded-2xl bg-stone-50 p-3 text-sm">
                <input type="radio" name="address" checked={addressId === address.id} onChange={() => setAddressId(address.id)} className="mr-2" />
                {address.name} {address.phone}
                <span className="mt-1 block text-stone-500">{address.province}{address.city}{address.district} {address.detail}</span>
              </label>
            ))}
          </div>
          <p className="mt-4 text-lg">应付 {yuan(total)}</p>
          {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
          <button disabled={pending || !chosen.length || !addressId} className="mt-4 w-full rounded-full bg-amber-800 py-2 text-sm text-white disabled:opacity-50">
            {pending ? '正在创建…' : '提交订单'}
          </button>
        </div>
      </div>
    </form>
  )
}
