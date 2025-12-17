export default function FlashcardsPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Flashcards</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Review Session</h2>
        <p className="text-gray-500 mb-4">
          No flashcards due for review at this time.
        </p>
        
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Generate Flashcards with AI
        </button>
      </div>
    </div>
  )
}
