import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-8">404 - Page Not Found</h1>
      <p className="text-xl text-slate-300 mb-8">
        The page you're looking for doesn't exist.
      </p>
      <Link 
        to="/" 
        className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-lg text-lg"
      >
        Go Home
      </Link>
    </div>
  )
} 