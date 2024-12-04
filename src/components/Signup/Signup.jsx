import { Link } from 'react-router-dom'
import { useForm } from '../../hooks/useForm'
import { validateEmail, validatePassword } from '../../utils/validation'

export default function Signup() {
  const validateSignup = (values) => {
    const errors = {}
    const emailError = validateEmail(values.email)
    const passwordError = validatePassword(values.password)
    
    if (emailError) errors.email = emailError
    if (passwordError) errors.password = passwordError
    if (!values.parsingMethod) errors.parsingMethod = 'Please select a parsing method'
    
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
    { 
      email: '', 
      password: '', 
      parsingMethod: 'pattern'
    },
    validateSignup
  )

  const onSubmit = async (formData) => {
    try {
      // Add your signup API call here
      console.log('Signup submitted:', formData)
    } catch (error) {
      throw new Error('Registration failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-blue-400 to-red-400">
      {/* Logo */}
      <div className="absolute top-4 sm:top-8 left-4 sm:left-8">
        <Link to="/" className="text-white text-xl sm:text-2xl font-bold">
          Tide Transform
        </Link>
      </div>

      {/* Signup Card */}
      <div className="min-h-screen flex items-center justify-center p-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md mx-auto">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Create your account
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
              <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
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
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Password
              </label>
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
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Select Parsing Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div
                  className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                    values.parsingMethod === 'pattern'
                      ? 'border-indigo-500 bg-indigo-50'
                      : errors.parsingMethod
                      ? 'border-red-300'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                  onClick={() => handleChange({ target: { name: 'parsingMethod', value: 'pattern' } })}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={values.parsingMethod === 'pattern'}
                      onChange={() => handleChange({ target: { name: 'parsingMethod', value: 'pattern' } })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">Pattern Detection</h3>
                      <p className="text-xs sm:text-sm text-gray-500">Traditional pattern-based parsing</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-3 sm:p-4 border rounded-lg cursor-pointer transition-all ${
                    values.parsingMethod === 'ai'
                      ? 'border-indigo-500 bg-indigo-50'
                      : errors.parsingMethod
                      ? 'border-red-300'
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                  onClick={() => handleChange({ target: { name: 'parsingMethod', value: 'ai' } })}
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      checked={values.parsingMethod === 'ai'}
                      onChange={() => handleChange({ target: { name: 'parsingMethod', value: 'ai' } })}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base">3S AI</h3>
                      <p className="text-xs sm:text-sm text-gray-500">AI-powered parsing solution</p>
                    </div>
                  </div>
                </div>
              </div>
              {errors.parsingMethod && (
                <p className="mt-1 text-xs text-red-500">{errors.parsingMethod}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-indigo-600 text-white py-2 sm:py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account?{' '}
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