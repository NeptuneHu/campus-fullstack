import { FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { errorMessage } from '../types'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as { from?: string; registered?: boolean } | null
  const from = state?.from || '/'
  const [username, setUsername] = useState('demo')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (user) navigate(from, { replace: true })
  }, [user, from, navigate])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      await login(username.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(errorMessage(err, '登录失败'))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
      <p className="text-sm text-orange-900">欢迎回来</p>
      <h1 className="serif mt-1 text-3xl">登录页边手记</h1>
      {state?.registered && <p className="mt-3 text-sm text-teal-700">注册成功，请登录。</p>}
      <label className="mt-6 block text-sm">
        用户名
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" />
      </label>
      <label className="mt-4 block text-sm">
        密码
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" />
      </label>
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button disabled={pending} className="mt-6 w-full rounded-xl bg-orange-900 py-2.5 text-white disabled:opacity-60">
        {pending ? '正在登录…' : '登录'}
      </button>
      <p className="mt-4 text-sm text-stone-500">
        还没有账号？ <Link to="/register" className="text-orange-900">去注册</Link>
      </p>
      <p className="mt-3 rounded-xl bg-stone-50 px-3 py-2 text-xs leading-5 text-stone-500">
        体验账号 demo / demo123，另一位作者是 lin / lin12345。demo 只能编辑自己的文章。
      </p>
    </form>
  )
}
