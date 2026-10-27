import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { errorMessage, formatDate, type Post } from '../types'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [email, setEmail] = useState(user?.email || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [posts, setPosts] = useState<Post[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    client.get('/users/me/posts').then((res) => setPosts(res.data.posts))
  }, [])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setMessage('')
    setError('')
    try {
      const res = await client.put('/users/me', { email, avatar })
      updateUser(res.data.user)
      setMessage('资料已保存')
    } catch (err) {
      setError(errorMessage(err, '保存失败'))
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <form onSubmit={onSubmit} className="h-fit rounded-3xl bg-white p-6 ring-1 ring-stone-200">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-orange-900 text-2xl text-white">
          {(user?.username || '我').slice(0, 1)}
        </div>
        <h1 className="serif mt-4 text-3xl">{user?.username}</h1>
        <p className="mt-1 text-xs text-stone-500">注册于 {user?.created_at ? formatDate(user.created_at) : '—'}</p>
        <label className="mt-5 block text-sm">
          邮箱
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" />
        </label>
        <label className="mt-3 block text-sm">
          头像 URL
          <input value={avatar} onChange={(e) => setAvatar(e.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2" placeholder="可以留空" />
        </label>
        {message && <p className="mt-3 text-sm text-teal-700">{message}</p>}
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button className="mt-4 w-full rounded-xl bg-stone-900 py-2 text-sm text-white">保存资料</button>
      </form>
      <section>
        <h2 className="serif text-2xl">我的文章</h2>
        <div className="mt-4 space-y-3">
          {posts.length === 0 && <p className="text-sm text-stone-500">还没有发表文章。</p>}
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="block rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200">
              <p className="text-xs text-orange-900">{post.category}</p>
              <p className="mt-1 font-medium">{post.title}</p>
              <p className="mt-1 text-xs text-stone-500">{formatDate(post.created_at)} · {post.views} 次浏览</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
