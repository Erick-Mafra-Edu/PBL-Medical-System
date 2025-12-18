'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Course = {
  id: string;
  name: string;
  description: string;
  color?: string;
  icon?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/courses`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load courses');
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err: any) {
      setError(err.message || 'Unable to load courses');
    } finally {
      setLoading(false);
    }
  }



  async function handleDelete(courseId: string) {
    try {
      setError(null);
      const res = await fetch(`${API_URL}/api/courses/${courseId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to delete course');
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    } catch (err: any) {
      setError(err.message || 'Unable to delete course');
    }
  }

  return (
    <div className="container mx-auto p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Organize your PBL courses</p>
          <h1 className="text-3xl font-bold">Courses</h1>
        </div>
        <Link
          href="/courses/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Course
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {loading && <p>Loading courses...</p>}
        {!loading && courses.length === 0 && (
          <div className="border border-dashed rounded-lg p-6 text-gray-500 col-span-full text-center">
            No courses yet. <Link href="/courses/create" className="text-blue-600 hover:underline">Create your first one</Link> to start organizing content.
          </div>
        )}

        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-lg shadow p-4 space-y-2 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-3xl">{course.icon || '📚'}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{course.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                </div>
              </div>
            </div>

            {course.color && (
              <div
                className="h-2 rounded-full"
                style={{ backgroundColor: course.color }}
              />
            )}

            <div className="flex gap-2 pt-2 border-t">
              <Link
                href={`/courses/edit/${course.id}`}
                className="flex-1 text-center text-blue-600 hover:text-blue-800 hover:underline py-1"
              >
                Edit
              </Link>
              <button
                className="flex-1 text-red-600 hover:text-red-800 hover:underline py-1"
                onClick={() => handleDelete(course.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
