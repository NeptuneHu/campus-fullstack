import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { errorMessage } from '../types'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setError('')
    try {
      await client.post('/auth/register', form)
      navigate('/login', { replace: true, state: { registered: true } })
    } catch (err) {
      setError(errorMessage(err, '注册失败'))
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md rounded-3xl bg-white p-8 ring-1 ring-stone-200">
      <h1 className="text-3xl font-semibold">注册</h1>
      {(['username', 'email', 'password'] as const).map((key) => (
        <label key={key} className="mt-4 block text-sm">
          {key === 'username' ? '用户名' : key === 'email' ? '邮箱' : '密码'}
          <input type={key === 'password' ? 'password' : 'text'} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" />
        </label>
      ))}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button className="mt-6 w-full rounded-xl bg-stone-900 py-2.5 text-white">注册</button>
      <p className="mt-4 text-sm text-stone-500">已有账号？ <Link to="/login" className="text-amber-900">去登录</Link></p>
    </form>
  )
}
