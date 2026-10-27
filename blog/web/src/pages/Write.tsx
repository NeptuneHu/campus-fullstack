import { FormEvent, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import client from '../api/client'
import { errorMessage, type Category } from '../types'

export default function Write() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('技术')
  const [tags, setTags] = useState('')
  const [cover, setCover] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)
  const [loading, setLoading] = useState(Boolean(id))

  useEffect(() => {
    client.get('/categories').then((res) => {
      setCategories(res.data.categories)
      if (!id && res.data.categories[0]) setCategory(res.data.categories[0].name)
    })
  }, [id])

  useEffect(() => {
    if (!id) return
    client
      .get(`/posts/${id}`, { params: { preview: 1 } })
      .then((res) => {
        const post = res.data.post
        setTitle(post.title)
        setContent(post.content)
        setCategory(post.category)
        setTags((post.tags || []).join('，'))
        setCover(post.cover || '')
      })
      .catch((err) => setError(errorMessage(err, '无法打开这篇文章')))
      .finally(() => setLoading(false))
  }, [id])

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    const payload = { title, content, category, tags, cover }
    try {
      const res = id
        ? await client.put(`/posts/${id}`, payload)
        : await client.post('/posts', payload)
      navigate(`/post/${res.data.post.id}`)
    } catch (err) {
      setError(errorMessage(err, '保存失败'))
    } finally {
      setPending(false)
    }
  }

  if (loading) return <p className="text-stone-500">正在取出原文…</p>

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-orange-900">{id ? '修改' : '新的一篇'}</p>
          <h1 className="serif text-4xl">{id ? '改这篇文章' : '写下来'}</h1>
        </div>
        <button disabled={pending} className="rounded-full bg-orange-900 px-5 py-2 text-sm text-white disabled:opacity-60">
          {pending ? '正在保存…' : '发布'}
        </button>
      </div>
      {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="标题"
        className="serif w-full bg-transparent text-3xl outline-none placeholder:text-stone-400"
      />
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm">
          {categories.map((item) => (
            <option key={item.id}>{item.name}</option>
          ))}
        </select>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="标签，用逗号分隔" className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm" />
        <input value={cover} onChange={(e) => setCover(e.target.value)} placeholder="封面图 URL，可以留空" className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm" />
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="左边写，右边看。支持 Markdown 标题和列表。"
          className="min-h-[420px] rounded-3xl border border-stone-200 bg-white p-5 leading-7 outline-none"
        />
        <div className="markdown min-h-[420px] rounded-3xl bg-white p-5 ring-1 ring-stone-200">
          {content ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-stone-400">预览会出现在这里</p>}
        </div>
      </div>
    </form>
  )
}
