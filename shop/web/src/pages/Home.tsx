import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { CATEGORIES, tones, yuan, type Product } from '../types'

export default function Home() {
  const [category, setCategory] = useState('')
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    client.get('/products', { params: { category } }).then((res) => setProducts(res.data.products))
  }, [category])

  return (
    <div>
      <section className="mb-6 rounded-3xl bg-amber-800 px-6 py-6 text-white">
        <p className="text-sm text-amber-100">练习小铺</p>
        <h1 className="mt-1 text-3xl font-semibold">先逛，下单后记为待支付</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-amber-100">这里不接入真实付款。库存会在创建订单时扣掉，取消待支付订单后再加回来。</p>
      </section>
      <div className="mb-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setCategory('')} className={`rounded-full px-3 py-1 text-sm ${category === '' ? 'bg-stone-900 text-white' : 'bg-white ring-1 ring-stone-200'}`}>全部</button>
        {CATEGORIES.map((item) => (
          <button key={item} type="button" onClick={() => setCategory(item)} className={`rounded-full px-3 py-1 text-sm ${category === item ? 'bg-stone-900 text-white' : 'bg-white ring-1 ring-stone-200'}`}>{item}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`} className="overflow-hidden rounded-3xl bg-white ring-1 ring-stone-200">
            <div className={`flex h-28 items-end bg-gradient-to-br p-4 text-sm text-white ${tones[product.category]}`}>{product.category}</div>
            <div className="p-4">
              <h2 className="font-medium">{product.name}</h2>
              <p className="mt-2 text-sm text-amber-900">{yuan(product.price)}</p>
              <p className="mt-1 text-xs text-stone-500">库存 {product.stock}{product.stock > 0 && product.stock <= 15 && <span className="ml-2 text-amber-800">只剩不多</span>}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
