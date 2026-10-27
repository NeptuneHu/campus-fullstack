import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { TAGS, errorMessage } from '../types'

export default function Ask() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selected, setSelected] = useState<string[]>(['课程'])
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  function toggle(tag: string) {
    setSelected((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag])
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      const res = await client.post('/questions', { title, content, tags: selected })
      navigate(`/question/${res.data.question.id}`)
    } catch (err) {
      setError(errorMessage(err, '发布失败'))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
      <p className="text-sm text-teal-800">消耗 5 声望</p>
      <h1 className="mt-1 text-3xl font-semibold">提一个问题</h1>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="一句话说清问题" className="mt-6 w-full rounded-xl border border-slate-200 px-3 py-2" />
      <div className="mt-4 flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button type="button" key={tag} onClick={() => toggle(tag)} className={`rounded-full px-3 py-1 text-sm ${selected.includes(tag) ? 'bg-teal-800 text-white' : 'bg-slate-100'}`}>{tag}</button>
        ))}
      </div>
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="你已经试过什么" className="mt-4 min-h-64 w-full rounded-2xl border border-slate-200 p-4" />
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      <button disabled={pending} className="mt-4 rounded-full bg-teal-800 px-5 py-2 text-sm text-white">{pending ? '正在发布…' : '发布问题'}</button>
    </form>
  )
}
