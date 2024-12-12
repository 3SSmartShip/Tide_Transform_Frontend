import { useState } from 'react'
import { apiKeysService } from '../api/services/apiKeys'

const CreateApiModel = ({ onClose, onApiKeyCreated }) => {
  const [name, setName] = useState('')

  const handleGenerate = async () => {
    try {
      const newApiKey = await apiKeysService.createApiKey(name)
      // Call the callback only if it exists
      if (onApiKeyCreated) {
        onApiKeyCreated(newApiKey)
      }
      onClose()
    } catch (error) {
      console.error('API key generation error:', error)
    }
  }

  return (
    <div>
      <input 
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter API key name"
      />
      <button onClick={handleGenerate}>Generate API Key</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  )
}

export default CreateApiModel
