export default function LibraryPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Library</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + Upload File
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Files</h2>
        <p className="text-gray-500">
          No files uploaded yet. Upload PDFs, PowerPoints, or other study materials.
        </p>
      </div>
    </div>
  )
}
