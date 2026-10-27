import { FormEvent, useEffect, useState } from 'react'
import client from '../api/client'
import { errorMessage, type Address } from '../types'

const empty = { name: '', phone: '', province: '湖北省', city: '武汉市', district: '洪山区', detail: '', is_default: false }

export default function Addresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<number | null>(null)
  const [error, setError] = useState('')

  function load() {
    return client.get('/addresses').then((res) => setAddresses(res.data.addresses))
  }

  useEffect(() => {
    load()
  }, [])

  function fill(address: Address) {
    setEditing(address.id)
    setForm({
      name: address.name,
      phone: address.phone,
      province: address.province,
      city: address.city,
      district: address.district,
      detail: address.detail,
      is_default: Boolean(address.is_default),
    })
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      if (editing) await client.put(`/addresses/${editing}`, form)
      else await client.post('/addresses', form)
      setEditing(null)
      setForm(empty)
      await load()
    } catch (err) {
      setError(errorMessage(err, '保存失败'))
    }
  }

  async function remove(id: number) {
    setError('')
    try {
      await client.delete(`/addresses/${id}`)
      await load()
    } catch (err) {
      setError(errorMessage(err, '删除失败'))
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
      <section>
        <h1 className="text-3xl font-semibold">收货地址</h1>
        <div className="mt-4 space-y-3">
          {addresses.map((address) => (
            <article key={address.id} className="rounded-3xl bg-white p-4 ring-1 ring-stone-200">
              <p className="font-medium">{address.name} {address.phone} {address.is_default ? <span className="ml-2 text-xs text-amber-800">默认</span> : null}</p>
              <p className="mt-1 text-sm text-stone-600">{address.province}{address.city}{address.district} {address.detail}</p>
              <div className="mt-3 flex gap-3 text-sm">
                <button type="button" onClick={() => fill(address)}>编辑</button>
                <button type="button" onClick={() => remove(address.id)} className="text-red-700">删除</button>
              </div>
            </article>
          ))}
        </div>
      </section>
      <form onSubmit={onSubmit} className="h-fit rounded-3xl bg-white p-5 ring-1 ring-stone-200">
        <h2 className="font-medium">{editing ? '修改地址' : '新增地址'}</h2>
        {(['name', 'phone', 'province', 'city', 'district', 'detail'] as const).map((key) => (
          <label key={key} className="mt-3 block text-sm">
            {{ name: '收货人', phone: '电话', province: '省', city: '市', district: '区', detail: '详细地址' }[key]}
            <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" />
          </label>
        ))}
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
          设为默认地址
        </label>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button className="mt-4 w-full rounded-full bg-amber-800 py-2 text-sm text-white">保存</button>
      </form>
    </div>
  )
}
