import { useState } from 'react'

export const useForm = (initialState, validate) => {
  const [values, setValues] = useState(initialState)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues({
      ...values,
      [name]: value,
    })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      })
    }
  }

  const handleBlur = (e) => {
    const { name } = e.target
    const validationErrors = validate(values)
    setErrors({
      ...errors,
      [name]: validationErrors[name],
    })
  }

  const handleSubmit = async (onSubmit) => {
    setIsSubmitting(true)
    const validationErrors = validate(values)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      try {
        await onSubmit(values)
      } catch (error) {
        setErrors({
          submit: error.message || 'An error occurred',
        })
      }
    }
    setIsSubmitting(false)
  }

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  }
}