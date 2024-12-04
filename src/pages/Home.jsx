import { useSelector, useDispatch } from 'react-redux'
import { increment, decrement, selectCount } from '../features/counter/counterSlice'

export default function Home() {
  const count = useSelector(selectCount)
  const dispatch = useDispatch()

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl font-bold mb-8">Welcome Home</h1>
      <div className="flex gap-4 items-center">
        <button
          onClick={() => dispatch(decrement())}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg"
        >
          -
        </button>
        <span className="text-2xl">{count}</span>
        <button
          onClick={() => dispatch(increment())}
          className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg"
        >
          +
        </button>
      </div>
    </div>
  )
} 