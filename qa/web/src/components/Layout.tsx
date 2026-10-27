import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-800 text-lg text-white">问</span>
            <span>
              <span className="block text-lg font-semibold leading-none">问一问</span>
              <span className="mt-1 block text-xs text-slate-500">课程和项目里的问题，留在这里</span>
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link to="/ask" className="rounded-full bg-teal-800 px-3 py-1.5 text-white">提问</Link>
                <Link to="/profile">声望 {user.points}</Link>
                <button type="button" onClick={logout} className="text-slate-500">退出</button>
              </>
            ) : (
              <>
                <Link to="/login">登录</Link>
                <Link to="/register" className="rounded-full bg-slate-900 px-3 py-1.5 text-white">注册</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
