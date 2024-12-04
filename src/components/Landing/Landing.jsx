import { Link } from "react-router-dom";
import { useForm } from '../../hooks/useForm'
import { validateEmail, validatePassword } from '../../utils/validation'

export default function Landing() {
  const validateLogin = (values) => {
    const errors = {}
    const emailError = validateEmail(values.email)
    const passwordError = validatePassword(values.password)
    
    if (emailError) errors.email = emailError
    if (passwordError) errors.password = passwordError
    
    return errors
  }

  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm(
    { email: '', password: '', rememberMe: false },
    validateLogin
  )

  const onSubmit = async (formData) => {
    try {
      // Add your login API call here
      console.log('Login submitted:', formData)
    } catch (error) {
      throw new Error('Login failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-red-400">
      {/* Logo - made responsive */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8">
        <Link to="/" className="text-white text-xl sm:text-2xl font-bold">
          Tide Transform
        </Link>
      </div>

      {/* Login Card - enhanced responsiveness */}
      <div className="min-h-screen flex items-center justify-center p-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Sign in to your account
          </h1>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
              {errors.submit}
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(onSubmit)
          }} className="space-y-4 sm:space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm text-gray-700"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Forgot your password?
                </Link>
              </div>
              <input
                type="password"
                id="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember-me"
                checked={values.rememberMe}
                onChange={(e) => handleChange(e)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me on this device
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              New to Tide Transform?{" "}
              <Link to="/signup" className="text-indigo-600 hover:text-indigo-500">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
