import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatDate, type Question } from '../types'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [questions, setQuestions] = useState<Question[]>([])

  useEffect(() => {
    client.get('/users/me').then((res) => updateUser(res.data.user))
    client.get('/users/me/questions').then((res) => setQuestions(res.data.questions))
  }, [])

  return (
    <div>
      <section className="rounded-3xl bg-teal-800 p-6 text-white">
        <p className="text-sm text-teal-100">{user?.username}</p>
        <p className="mt-2 text-5xl font-semibold">{user?.points}</p>
        <p className="mt-1 text-sm text-teal-100">声望。提问 -5，回答 +10，被采纳 +30，获赞也会增加。</p>
      </section>
      <h2 className="mt-8 text-xl font-semibold">我提过的问题</h2>
      <div className="mt-3 space-y-3">
        {questions.length === 0 && <p className="text-sm text-slate-500">还没有提过问题。</p>}
        {questions.map((question) => (
          <Link key={question.id} to={`/question/${question.id}`} className="block rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200">
            <p className="font-medium">{question.title}</p>
            <p className="mt-1 text-xs text-slate-500">{question.is_solved ? '已解决' : '未解决'} · {question.answers_count} 个回答 · {formatDate(question.created_at)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
