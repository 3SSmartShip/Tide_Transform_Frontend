import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <>
      <nav className="bg-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            My App
          </Link>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-slate-300">
              Home
            </Link>
            <Link to="/posts" className="hover:text-slate-300">
              Posts
            </Link>
            <Link to="/about" className="hover:text-slate-300">
              About
            </Link>
          </div>
        </div>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  )
} 