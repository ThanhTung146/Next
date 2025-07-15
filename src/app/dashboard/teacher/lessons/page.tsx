'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Lesson = {
    id: number
    name: string
    content: string
    videoUrl?: string
    videoSize?: number
    createdAt: string
    group: {
        id: number
        name: string
    }
    creator: {
        id: number
        name: string
        email: string
    }
}

export default function TeacherLessonsPage() {
    const router = useRouter()
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const pageSize = 5

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                setLoading(true)
                setError('')
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Please log in to access this page.')
                }

                const res = await fetch('http://localhost:3000/lessons', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`)
                }

                const data = await res.json()
                console.log('Teacher lessons data received:', data)
                setLessons(Array.isArray(data.data) ? data.data : [])
            } catch (err) {
                console.error('Error fetching teacher lessons:', err)
                setError(err instanceof Error ? err.message : 'Cannot load lesson list')
                setLessons([])
            } finally {
                setLoading(false)
            }
        }

        fetchLessons()
    }, [])

    const deleteLesson = async (lessonId: number) => {
        if (!confirm('Do you want to delete this lesson?')) return

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`http://localhost:3000/lessons/${lessonId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.ok) {
                setLessons(lessons.filter(lesson => lesson.id !== lessonId))
                alert('Lesson deleted successfully!')
            } else {
                alert('Failed to delete lesson')
            }
        } catch (error) {
            console.error('Error deleting lesson:', error)
            alert('Failed to delete lesson')
        }
    }

    const paginated = lessons.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📚 Lesson Management</h1>
                <button
                    onClick={() => router.push('/dashboard/teacher/lessons/create')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
                >
                    ➕ Create New Lesson
                </button>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border rounded shadow-sm animate-pulse">
                            <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                            <div className="h-3 bg-gray-300 rounded mb-1 w-1/2"></div>
                            <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <div className="text-red-500 mb-4">❌ {error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                    >
                        🔄 Retry
                    </button>
                </div>
            ) : lessons.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">📭 No lessons yet</div>
                    <p className="text-sm text-gray-400 mb-4">You haven't created any lessons yet.</p>
                    <button
                        onClick={() => router.push('/dashboard/teacher/lessons/create')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                        📚 Create
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {paginated.map((lesson) => (
                            <div key={lesson.id} className="p-4 border rounded shadow-sm hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-blue-700 text-lg">
                                        {lesson.name}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => router.push(`/dashboard/teacher/lessons/${lesson.id}`)}
                                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded"
                                        >
                                            👁️ Details
                                        </button>
                                        <button
                                            onClick={() => router.push(`/dashboard/teacher/lessons/${lesson.id}/edit`)}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            onClick={() => deleteLesson(lesson.id)}
                                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-2">
                                    {lesson.content}
                                </p>

                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>
                                        Group: {lesson.group?.name || 'No group assigned'}
                                    </span>
                                    <span>
                                        Created: {new Date(lesson.createdAt).toLocaleDateString('en-US')}
                                    </span>
                                </div>

                                {lesson.videoUrl && (
                                    <div className="mt-2">
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            📹 Has Video
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {Math.ceil(lessons.length / pageSize) > 1 && (
                        <div className="mt-6 flex justify-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ←
                            </button>

                            {Array.from({ length: Math.ceil(lessons.length / pageSize) }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPage(i + 1)}
                                    className={`px-3 py-1 rounded ${page === i + 1
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-200 hover:bg-gray-300'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(Math.min(Math.ceil(lessons.length / pageSize), page + 1))}
                                disabled={page === Math.ceil(lessons.length / pageSize)}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
