import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { excerpt, formatDate, tones, type Category, type Post } from '../types'

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState('')
  const [draft, setDraft] = useState('')
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client.get('/categories').then((res) => setCategories(res.data.categories))
  }, [])

  useEffect(() => {
    setLoading(true)
    client
      .get('/posts', { params: { page, pageSize: 10, category, keyword } })
      .then((res) => {
        setPosts(res.data.posts)
        setTotal(res.data.total)
      })
      .finally(() => setLoading(false))
  }, [page, category, keyword])

  const pages = Math.max(1, Math.ceil(total / 10))

  return (
    <div>
      <section className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-orange-900">首页</p>
          <h1 className="serif mt-1 text-4xl">最近写下的</h1>
          <p className="mt-2 text-sm text-stone-500">共 {total} 篇，可按分类看，也可以搜标题和正文。</p>
        </div>
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            setPage(1)
            setKeyword(draft.trim())
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="搜索笔记"
            className="w-52 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm"
          />
          <button className="rounded-full bg-stone-900 px-4 py-2 text-sm text-white">搜索</button>
        </form>
      </section>

      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => { setCategory(''); setPage(1) }}
          className={`rounded-full px-3 py-1 text-sm ${category === '' ? 'bg-orange-900 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200'}`}
        >
          全部
        </button>
        {categories.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => { setCategory(item.name); setPage(1) }}
            className={`rounded-full px-3 py-1 text-sm ${category === item.name ? 'bg-orange-900 text-white' : 'bg-white text-stone-600 ring-1 ring-stone-200'}`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-stone-500">正在取文章…</p>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl bg-white p-10 text-center ring-1 ring-stone-200">
          <p className="serif text-2xl">这里还没有文章</p>
          <p className="mt-2 text-sm text-stone-500">换个分类，或者把搜索词清空。</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <Link key={post.id} to={`/post/${post.id}`} className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-stone-200">
              <div className={`flex h-28 items-end bg-gradient-to-br p-4 text-white ${tones[post.category] || 'from-stone-700 to-stone-900'}`}>
                <span className="text-sm">{post.category}</span>
              </div>
              <div className="p-5">
                <h2 className="serif text-2xl leading-snug">{post.title}</h2>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{excerpt(post.content)}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-stone-500">
                  <span>{post.author_name}</span>
                  <span>{formatDate(post.created_at)}</span>
                  <span>{post.views} 次浏览</span>
                  {post.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-stone-100 px-2 py-0.5">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((n) => n - 1)} className="rounded-full bg-white px-4 py-2 ring-1 ring-stone-200 disabled:opacity-40">上一页</button>
          <span className="text-stone-500">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((n) => n + 1)} className="rounded-full bg-white px-4 py-2 ring-1 ring-stone-200 disabled:opacity-40">下一页</button>
        </div>
      )}
    </div>
  )
}
