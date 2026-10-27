import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-stone-200/80 bg-[#f7f3ec]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-orange-900 text-lg text-white">页</span>
            <span>
              <span className="serif block text-xl leading-none">页边手记</span>
              <span className="mt-1 block text-xs text-stone-500">把读过、做过、想过的事写成文章</span>
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link to="/write" className="rounded-full bg-orange-900 px-3 py-1.5 text-white">写一篇</Link>
                <Link to="/profile">{user.username}</Link>
                <button type="button" onClick={logout} className="text-stone-500">退出</button>
              </>
            ) : (
              <>
                <Link to="/login">登录</Link>
                <Link to="/register" className="rounded-full bg-stone-900 px-3 py-1.5 text-white">注册</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
