import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { TAGS, formatDate, type Question } from '../types'

const sorts = [
  { id: 'latest', label: '最新' },
  { id: 'hot', label: '热门' },
  { id: 'unsolved', label: '未解决' },
]

export default function Home() {
  const [sort, setSort] = useState('latest')
  const [tag, setTag] = useState('')
  const [page, setPage] = useState(1)
  const [questions, setQuestions] = useState<Question[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    client
      .get('/questions', { params: { sort, tag, page, pageSize: 10 } })
      .then((res) => {
        setQuestions(res.data.questions)
        setTotal(res.data.total)
      })
      .finally(() => setLoading(false))
  }, [sort, tag, page])

  const pages = Math.max(1, Math.ceil(total / 10))

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-teal-800">问答</p>
        <h1 className="mt-1 text-3xl font-semibold">先看看别人卡在哪</h1>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {sorts.map((item) => (
          <button key={item.id} type="button" onClick={() => { setSort(item.id); setPage(1) }} className={`rounded-full px-3 py-1 text-sm ${sort === item.id ? 'bg-teal-800 text-white' : 'bg-white ring-1 ring-slate-200'}`}>{item.label}</button>
        ))}
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => { setTag(''); setPage(1) }} className={`rounded-full px-3 py-1 text-sm ${tag === '' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>全部标签</button>
        {TAGS.map((item) => (
          <button key={item} type="button" onClick={() => { setTag(item); setPage(1) }} className={`rounded-full px-3 py-1 text-sm ${tag === item ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{item}</button>
        ))}
      </div>
      {loading ? <p className="text-slate-500">正在取问题…</p> : (
        <div className="space-y-3">
          {questions.length === 0 && <p className="rounded-2xl bg-white p-8 text-center text-slate-500 ring-1 ring-slate-200">这个标签下还没有问题。</p>}
          {questions.map((question) => (
            <Link key={question.id} to={`/question/${question.id}`} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-900">
                <span className="text-lg font-semibold leading-none">{question.votes}</span>
                <span className="text-[10px]">赞</span>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {question.is_solved && <span className="rounded-full bg-teal-800 px-2 py-0.5 text-xs text-white">已解决</span>}
                  <h2 className="font-medium">{question.title}</h2>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {question.author_name} · {question.answers_count} 个回答 · {question.views} 次浏览 · {formatDate(question.created_at)}
                  {question.tags.map((item) => <span key={item} className="ml-2 rounded-full bg-slate-100 px-2 py-0.5">{item}</span>)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
      {pages > 1 && (
        <div className="mt-6 flex justify-center gap-3 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((n) => n - 1)} className="rounded-full bg-white px-4 py-2 ring-1 ring-slate-200 disabled:opacity-40">上一页</button>
          <span>{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage((n) => n + 1)} className="rounded-full bg-white px-4 py-2 ring-1 ring-slate-200 disabled:opacity-40">下一页</button>
        </div>
      )}
    </div>
  )
}
