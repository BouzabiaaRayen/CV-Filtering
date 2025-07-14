import { useState } from 'react'

export default function LoginPage() {
  const [userType, setUserType] = useState<'Client' | 'HR'>('Client')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [selem, setSelem] = useState('')

  return (
    <div className="flex flex-col justify-center w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-1">Hello Again!</h1>
      <p className="text-gray-500 mb-6">Welcome Back</p>

      <div className="flex space-x-4 mb-6">
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
            userType === 'Client' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setUserType('Client')}
        >
          Client
        </button>
        <button
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${
            userType === 'HR' ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
          }`}
          onClick={() => setUserType('HR')}
        >
          HR
        </button>
      </div>

      <form className="space-y-4" onSubmit={e => e.preventDefault()}>
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
          </span>
          <input
            type="email"
            placeholder="Email Address"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
          </span>
          <input
            type="password"
            placeholder="Password"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
            <input
              type="tex"
              placeholder='Selem'
              className=' pr-3 border-gray-300 rounded-lg pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:border-blue-500 border '
              value={selem}
                onChange={e => setSelem(e.target.value)}
              required
              
              />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  )
}
