import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { errorMessage, formatDate, type Answer, type Question } from '../types'

export default function QuestionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [question, setQuestion] = useState<Question | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  function load() {
    return client.get(`/questions/${id}`).then((res) => {
      setQuestion(res.data.question)
      setAnswers(res.data.answers)
    })
  }

  useEffect(() => {
    load().catch((err) => setError(errorMessage(err, '问题不存在')))
  }, [id])

  async function voteQuestion() {
    if (!user) return
    await client.post(`/questions/${id}/vote`)
    await load()
  }

  async function voteAnswer(answerId: number) {
    await client.post(`/answers/${answerId}/vote`)
    await load()
  }

  async function accept(answerId: number) {
    setNotice('')
    setError('')
    try {
      const res = await client.post(`/answers/${answerId}/accept`)
      setNotice(res.data.message)
      await load()
    } catch (err) {
      setError(errorMessage(err, '采纳失败'))
    }
  }

  async function onAnswer(event: FormEvent) {
    event.preventDefault()
    setError('')
    setNotice('')
    try {
      const res = await client.post(`/questions/${id}/answers`, { content })
      setContent('')
      setNotice(res.data.message)
      await load()
    } catch (err) {
      setError(errorMessage(err, '回答失败'))
    }
  }

  if (error && !question) return <p className="text-red-700">{error}</p>
  if (!question) return <p className="text-slate-500">正在打开问题…</p>
  const mine = user && Number(user.id) === Number(question.author_id)

  return (
    <div>
      <article className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
        <div className="flex gap-4">
          <button type="button" onClick={voteQuestion} disabled={!user} className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl ${question.voted ? 'bg-teal-800 text-white' : 'bg-teal-50 text-teal-900'} disabled:opacity-60`}>
            <span className="text-xl font-semibold leading-none">{question.votes}</span>
            <span className="text-[10px]">{question.voted ? '已赞' : '点赞'}</span>
          </button>
          <div>
            <div className="flex flex-wrap gap-2">
              {question.is_solved && <span className="rounded-full bg-teal-800 px-2 py-0.5 text-xs text-white">已解决</span>}
              {question.tags.map((tag) => <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{tag}</span>)}
            </div>
            <h1 className="mt-2 text-2xl font-semibold">{question.title}</h1>
            <p className="mt-2 text-xs text-slate-500">{question.author_name} · 声望 {question.author_points} · {formatDate(question.created_at)} · {question.views} 次浏览</p>
          </div>
        </div>
        <div className="markdown mt-5 text-[16px]">
          <ReactMarkdown>{question.content}</ReactMarkdown>
        </div>
        {!user && <p className="mt-4 text-sm text-slate-500">登录后可以点赞、回答。 <Link to="/login" className="text-teal-800">去登录</Link></p>}
      </article>

      <section className="mt-6 space-y-3">
        <h2 className="text-lg font-semibold">{answers.length} 个回答</h2>
        {answers.map((answer) => (
          <article key={answer.id} className={`rounded-3xl bg-white p-5 ring-1 ${answer.is_accepted ? 'ring-teal-700' : 'ring-slate-200'}`}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-slate-500">
                {answer.author_name} · 声望 {answer.author_points}
                {answer.is_accepted && <span className="ml-2 rounded-full bg-teal-800 px-2 py-0.5 text-xs text-white">已采纳</span>}
              </p>
              <button type="button" disabled={!user} onClick={() => voteAnswer(answer.id)} className={`rounded-full px-3 py-1 text-xs ${answer.voted ? 'bg-teal-800 text-white' : 'bg-slate-100'} disabled:opacity-50`}>
                {answer.voted ? '已赞' : '点赞'} {answer.votes}
              </button>
            </div>
            <div className="markdown mt-3">
              <ReactMarkdown>{answer.content}</ReactMarkdown>
            </div>
            {mine && !question.is_solved && (
              <button type="button" onClick={() => accept(answer.id)} className="mt-3 rounded-full bg-teal-800 px-3 py-1.5 text-sm text-white">采纳为最佳答案</button>
            )}
          </article>
        ))}
      </section>

      {user && !mine && (
        <form onSubmit={onAnswer} className="mt-6 rounded-3xl bg-white p-5 ring-1 ring-slate-200">
          <h2 className="font-semibold">写一个回答</h2>
          <p className="mt-1 text-xs text-slate-500">发布后声望 +10。支持 Markdown。</p>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} className="mt-3 min-h-36 w-full rounded-2xl border border-slate-200 p-3" />
          <button className="mt-3 rounded-full bg-slate-900 px-4 py-2 text-sm text-white">发布回答</button>
        </form>
      )}
      {user && mine && <p className="mt-4 text-sm text-slate-500">这是你提的问题，不能回答自己。可以采纳别人的回答。</p>}
      {notice && <p className="mt-3 text-sm text-teal-700">{notice}</p>}
      {error && question && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  )
}
