import { useState } from 'react'
import { documentsApi } from '../../api/services/documents'
import { UploadIcon, X, Loader } from 'lucide-react'
import { motion } from 'framer-motion'
import Layout from '../Layout/Layout'
import ReactJson from '@microlink/react-json-view'
export default function Upload() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [parsedData, setParsedData] = useState(null)

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length > 0) {
      setFiles(selectedFiles)
      setError(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFiles = Array.from(e.dataTransfer.files)
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles)
      setError(null)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select a file to transform')
      return
    }

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', files[0])

    try {
      const response = await documentsApi.transformDocument(formData)
      setParsedData(response)
      setFiles([])
    } catch (err) {
      setError(err.message || 'Error processing file')
    } finally {
      setUploading(false)
    }
  }
  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold text-white mb-6">Transform Document</h1>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              files.length > 0 ? 'border-[#EEFF00]' : 'border-gray-700'}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="fileInput"
              accept=".pdf,.doc,.docx,.txt"
            />
            <label htmlFor="fileInput" className="cursor-pointer">
              <div className="bg-[#EEFF00] rounded-lg p-4 w-16 h-16 mx-auto mb-4">
                <UploadIcon className="h-8 w-8 text-black" />
              </div>
              <p className="text-gray-400">Drop files here or click to upload</p>
              <p className="text-sm text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX, TXT</p>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-4">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-800 p-3 rounded-md">
                  <span className="text-gray-300">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="text-gray-400 hover:text-red-500">
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleUpload}
            disabled={uploading || files.length === 0}
            className="mt-6 w-full bg-[#EEFF00] text-black py-3 px-4 rounded-md font-medium relative"
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <Loader className="animate-spin mr-2" size={20} />
                Processing Document...
              </span>
            ) : (
              'Transform Document'
            )}
          </motion.button>

          {parsedData && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-gray-900 rounded-lg p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-4">Transformation Results</h2>
              <ReactJson src={parsedData} theme="monokai" collapsed={1} />
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  )
}
