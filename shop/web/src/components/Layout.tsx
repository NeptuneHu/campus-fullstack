import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-amber-200/70 bg-[#f8f3ea]/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-800 text-lg text-white">铺</span>
            <span>
              <span className="block text-lg font-semibold leading-none">角落小铺</span>
              <span className="mt-1 block text-xs text-stone-500">宿舍里用得上的小东西</span>
            </span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-sm">
            {user ? (
              <>
                <Link to="/cart">购物车</Link>
                <Link to="/orders">订单</Link>
                <Link to="/addresses">地址</Link>
                <span className="text-stone-500">{user.username}</span>
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
