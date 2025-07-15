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

export default function StudentLessonsPage() {
    const router = useRouter()
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const pageSize = 10

    useEffect(() => {
        const fetchStudentLessons = async () => {
            try {
                setLoading(true)
                setError('')
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Please log in again')
                }

                // Fetch lessons through groups that student belongs to
                const res = await fetch('http://localhost:3000/groups/student', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ studentId: localStorage.getItem('id') }),
                })

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`)
                }

                const groups = await res.json()
                console.log('Student groups data received:', groups)

                // Extract all lessons from all groups
                const allLessons: Lesson[] = []
                const groupsArray = Array.isArray(groups) ? groups : []
                groupsArray.forEach((group: any) => {
                    if (group.lessons && Array.isArray(group.lessons)) {
                        group.lessons.forEach((lesson: any) => {
                            allLessons.push({
                                ...lesson,
                                group: {
                                    id: group.id,
                                    name: group.name
                                }
                            })
                        })
                    }
                })

                // Sort by creation date (newest first)
                allLessons.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                
                setLessons(allLessons)
            } catch (err) {
                console.error('Error fetching student lessons:', err)
                setError(err instanceof Error ? err.message : 'Cannot load lesson list')
                setLessons([])
            } finally {
                setLoading(false)
            }
        }

        fetchStudentLessons()
    }, [])

    const paginated = lessons.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📚 My Lessons</h1>
                <div className="text-sm text-gray-500">
                    Total: {lessons.length} lessons
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="bg-white border rounded-lg p-4">
                                <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
                                <div className="h-3 bg-gray-300 rounded mb-2 w-1/2"></div>
                                <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <div className="text-red-500 mb-4">❌ {error}</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                        🔄 Retry
                    </button>
                </div>
            ) : lessons.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">📚 No lessons available yet</div>
                    <p className="text-sm text-gray-400">
                        Lessons will appear here when your teachers create them
                    </p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {paginated.map((lesson) => (
                            <div key={lesson.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                                📚 Lesson
                                            </span>
                                            {lesson.videoUrl && (
                                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                                    📹 Has Video
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {lesson.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {lesson.content}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                            <span>👨‍🏫 {lesson.creator.name}</span>
                                            <span>📝 Group: {lesson.group.name}</span>
                                            <span>📅 {new Date(lesson.createdAt).toLocaleDateString('en-US')}</span>
                                            {lesson.videoSize && (
                                                <span>📊 {(lesson.videoSize / (1024 * 1024)).toFixed(1)} MB</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 ml-4">
                                        <button
                                            onClick={() => router.push(`/dashboard/student/lessons/${lesson.id}`)}
                                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                                        >
                                            📖 View Lesson
                                        </button>
                                        {lesson.videoUrl && (
                                            <button
                                                onClick={() => window.open(lesson.videoUrl, '_blank')}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded-lg transition-colors"
                                            >
                                                🎬 Watch Video
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {lessons.length > pageSize && (
                        <div className="flex justify-center items-center space-x-4 mt-6">
                            <button
                                onClick={() => setPage(page - 1)}
                                disabled={page === 1}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded"
                            >
                                ← Previous
                            </button>
                            <span className="text-gray-600">
                                Page {page} of {Math.ceil(lessons.length / pageSize)}
                            </span>
                            <button
                                onClick={() => setPage(page + 1)}
                                disabled={page === Math.ceil(lessons.length / pageSize)}
                                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
