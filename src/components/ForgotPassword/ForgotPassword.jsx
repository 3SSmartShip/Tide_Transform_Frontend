import { Link } from 'react-router-dom'
import { useForm } from '../../hooks/useForm'
import { validateEmail } from '../../utils/validation'

export default function ForgotPassword() {
  const validateForgotPassword = (values) => {
    const errors = {}
    const emailError = validateEmail(values.email)
    if (emailError) errors.email = emailError
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
    { email: '' },
    validateForgotPassword
  )

  const onSubmit = async (formData) => {
    try {
      // Add your password reset API call here
      console.log('Password reset requested for:', formData.email)
      return true // Return true to show success state
    } catch (error) {
      throw new Error('Password reset request failed. Please try again.')
    }
  }

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    const success = await handleSubmit(onSubmit)
    if (success) {
      setIsSubmitted(true)
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

      {/* Forgot Password Card - enhanced responsiveness */}
      <div className="min-h-screen flex items-center justify-center p-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto">
          {!isSubmitted ? (
            <>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
                Reset your password
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Enter your email address and we'll send you instructions to reset your password.
              </p>

              {errors.submit && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                    Email address
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
                    placeholder="your@email.com"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send reset instructions'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <svg
                  className="h-10 w-10 sm:h-12 sm:w-12 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Check your email</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                If an account exists for {values.email}, you will receive password reset instructions.
              </p>
            </div>
          )}

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Remember your password?{' '}
              <Link to="/" className="text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 