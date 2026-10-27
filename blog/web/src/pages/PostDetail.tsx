import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { errorMessage, formatDate, tones, type Post } from '../types'

export default function PostDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    client
      .get(`/posts/${id}`)
      .then((res) => setPost(res.data.post))
      .catch((err) => setError(errorMessage(err, '文章不存在')))
  }, [id])

  async function onDelete() {
    if (!post || !window.confirm('删除后不能恢复，确定删除这篇文章？')) return
    await client.delete(`/posts/${post.id}`)
    navigate('/')
  }

  if (error) return <p className="text-red-700">{error}</p>
  if (!post) return <p className="text-stone-500">正在打开文章…</p>

  const mine = user && Number(user.id) === Number(post.author_id)

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200">
      <div className={`px-8 py-10 text-white bg-gradient-to-br ${tones[post.category] || 'from-stone-700 to-stone-900'}`}>
        <p className="text-sm text-white/80">{post.category}</p>
        <h1 className="serif mt-2 text-4xl leading-tight">{post.title}</h1>
        <p className="mt-4 text-sm text-white/80">
          {post.author_name} · {formatDate(post.created_at)} · {post.views} 次浏览
        </p>
      </div>
      <div className="px-8 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{tag}</span>
          ))}
        </div>
        <div className="markdown text-[17px]">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
        {mine && (
          <div className="mt-8 flex gap-3">
            <Link to={`/write/${post.id}`} className="rounded-full bg-orange-900 px-4 py-2 text-sm text-white">编辑</Link>
            <button type="button" onClick={onDelete} className="rounded-full px-4 py-2 text-sm text-red-700 ring-1 ring-red-200">删除</button>
          </div>
        )}
      </div>
    </article>
  )
}
