import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { errorMessage } from '../types'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  function setField(key: 'username' | 'email' | 'password', value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      await client.post('/auth/register', form)
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) {
      setError(errorMessage(err, '注册失败'))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
      <p className="text-sm text-orange-900">新的一页</p>
      <h1 className="serif mt-1 text-3xl">注册</h1>
      <label className="mt-6 block text-sm">
        用户名
        <input value={form.username} onChange={(e) => setField('username', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" placeholder="3-20 个字符" />
      </label>
      <label className="mt-4 block text-sm">
        邮箱
        <input value={form.email} onChange={(e) => setField('email', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" placeholder="you@example.com" />
      </label>
      <label className="mt-4 block text-sm">
        密码
        <input type="password" value={form.password} onChange={(e) => setField('password', e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" placeholder="至少 6 位" />
      </label>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button disabled={pending} className="mt-6 w-full rounded-xl bg-stone-900 py-2.5 text-white disabled:opacity-60">
        {pending ? '正在注册…' : '注册'}
      </button>
      <p className="mt-4 text-sm text-stone-500">
        已有账号？ <Link to="/login" className="text-orange-900">去登录</Link>
      </p>
    </form>
  )
}
