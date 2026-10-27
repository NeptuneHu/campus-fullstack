import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { errorMessage, tones, yuan, type Product } from '../types'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    client.get(`/products/${id}`).then((res) => setProduct(res.data.product)).catch(() => setError('商品不存在'))
  }, [id])

  async function add() {
    if (!user) {
      navigate('/login', { state: { from: `/product/${id}` } })
      return
    }
    setError('')
    setMessage('')
    try {
      await client.post('/cart', { product_id: Number(id), quantity })
      setMessage('已放入购物车')
    } catch (err) {
      setError(errorMessage(err, '加入失败'))
    }
  }

  if (error && !product) return <p className="text-red-700">{error}</p>
  if (!product) return <p className="text-stone-500">正在打开商品…</p>

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <div className={`flex min-h-64 items-end rounded-3xl bg-gradient-to-br p-5 text-white ${tones[product.category]}`}>{product.category}</div>
      <div className="rounded-3xl bg-white p-6 ring-1 ring-stone-200">
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="mt-3 text-2xl text-amber-900">{yuan(product.price)}</p>
        <p className="mt-1 text-sm text-stone-500">库存 {product.stock}{product.stock > 0 && product.stock <= 15 && <span className="ml-2 text-amber-800">只剩不多</span>}</p>
        <p className="mt-4 leading-7 text-stone-700">{product.description}</p>
        <div className="mt-6 flex items-center gap-3">
          <input type="number" min={1} max={product.stock} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-24 rounded-xl border border-stone-200 px-3 py-2" />
          <button type="button" onClick={add} className="rounded-full bg-amber-800 px-5 py-2 text-sm text-white">加入购物车</button>
          <Link to="/cart" className="text-sm text-stone-500">去购物车</Link>
        </div>
        {message && <p className="mt-3 text-sm text-teal-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </div>
    </div>
  )
}
