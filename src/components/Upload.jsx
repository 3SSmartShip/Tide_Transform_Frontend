import { documentsApi } from '../api/services/documents'

const handleUpload = async (event) => {
  event.preventDefault()
  const formData = new FormData()
  formData.append('file', file)
  
  try {
    const result = await documentsApi.transformDocument(formData)
    // Handle successful transformation
    console.log('Transform result:', result)
  } catch (error) {
    // Handle error state
    console.error('Upload failed:', error)
  }
}
