import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import client from '../api/client'
import { errorMessage } from '../types'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

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
    <form onSubmit={onSubmit} className="mx-auto max-w-md rounded-3xl bg-white p-8 ring-1 ring-slate-200">
      <h1 className="text-3xl font-semibold">注册</h1>
      <p className="mt-2 text-sm text-slate-500">注册后获得 100 声望。提一个问题会用掉 5 点。</p>
      {(['username', 'email', 'password'] as const).map((key) => (
        <label key={key} className="mt-4 block text-sm">
          {key === 'username' ? '用户名' : key === 'email' ? '邮箱' : '密码'}
          <input
            type={key === 'password' ? 'password' : 'text'}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </label>
      ))}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button disabled={pending} className="mt-6 w-full rounded-xl bg-slate-900 py-2.5 text-white">注册</button>
      <p className="mt-4 text-sm text-slate-500">已有账号？ <Link to="/login" className="text-teal-800">去登录</Link></p>
    </form>
  )
}
