const ParentComponent = () => {
  const handleApiKeyCreated = (newKey) => {
    // Handle the newly created API key
    console.log('New API key created:', newKey)
  }

  return (
    <CreateApiModel 
      onClose={() => {/* handle close */}} 
      onApiKeyCreated={handleApiKeyCreated}
    />
  )
}
