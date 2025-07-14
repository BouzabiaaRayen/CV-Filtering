import { useState } from 'react'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

export default function App() {
  const [page, setPage] = useState<'login' | 'signup'>('login')

  return (
    <div className="min-h-screen flex">
      <div className="flex flex-col justify-center items-center w-3/5 bg-gradient-to-b from-blue-600 to-blue-400 text-white p-12">
        <h1 className="text-4xl font-bold mb-4">ProxymHR</h1>
        <p className="text-sm max-w-xs text-center">
          "HR Without the Headache – Everything You Need in One Platform."
        </p>
      </div>

      
      <div className="flex flex-col justify-center w-2/5 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto">
          {page === 'login' ? <LoginPage /> : <SignupPage />}
          <div className="mt-4 text-center">
            {page === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setPage('signup')}
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => setPage('login')}
                >
                  Log in
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
