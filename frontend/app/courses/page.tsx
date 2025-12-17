export default function CoursesPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          + New Course
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-2">📚</div>
          <h3 className="text-xl font-semibold mb-2">Sample Course</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first course</p>
          <div className="text-sm text-gray-500">
            <span>0 flashcards</span> • <span>0 notes</span>
          </div>
        </div>
      </div>
    </div>
  )
}
