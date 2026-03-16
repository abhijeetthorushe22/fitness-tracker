import { AtSignIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

const Login = () => {
  const [state, setState] = useState('signup')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showpassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { login, signup, user } = useAppContext()

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (state === 'login') {
        await login({ email, password })
      } else {
        await signup({ username, email, password })
      }
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <main className="login-page-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h2 className="text-3xl font-medium text-gray-900 dark:text-white">
            {state === 'login' ? 'Sign In' : 'Sign Up'}
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {state === 'login'
              ? 'Please enter email and password to access.'
              : 'Please enter your details to create an account.'}
          </p>

          {/* Username (only for signup) */}
          {state !== 'login' && (
            <div className="mt-4">
              <label className="font-medium text-sm text-gray-700 dark:text-gray-300">Username</label>
              <div className="relative mt-2">
                <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  className="login-input"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="mt-4">
            <label className="font-medium text-sm text-gray-700 dark:text-gray-300">Email</label>
            <div className="relative mt-2">
              <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                className="login-input"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mt-4">
            <label className="font-medium text-sm text-gray-700 dark:text-gray-300">Password</label>
            <div className="relative mt-2">
              <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showpassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="login-input pr-10"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showpassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          {/* Toggle Login/Signup */}
          <p className="mt-4 text-sm text-center text-gray-500 dark:text-gray-400">
            {state === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              className="text-blue-600 hover:underline dark:text-blue-400"
              onClick={() => setState(state === 'login' ? 'signup' : 'login')}
            >
              {state === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>

          {/* Submit Button */}
          <button type="submit" disabled={isSubmitting}
            className="login-button mt-6">
              {isSubmitting ? "Signing in..." : state === "login" ? "Login" : "Signup"}
          </button>
        </form>
      </main>
    </>
  )
}

export default Login