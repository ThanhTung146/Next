'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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

export default function TeacherLessonDetailPage() {
    const params = useParams()
    const router = useRouter()
    const lessonId = params.id as string
    
    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchLessonDetail = async () => {
            try {
                setLoading(true)
                setError('')
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Please log in again')
                }

                const res = await fetch(`http://localhost:3000/lessons/${lessonId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (!res.ok) {
                    throw new Error(`Error loading lesson: ${res.status}`)
                }

                const data = await res.json()
                setLesson(data)
            } catch (err) {
                console.error('Error fetching lesson detail:', err)
                setError(err instanceof Error ? err.message : 'Cannot load lesson information')
            } finally {
                setLoading(false)
            }
        }

        if (lessonId) {
            fetchLessonDetail()
        }
    }, [lessonId])

    const deleteLesson = async () => {
        if (!confirm('Are you sure you want to delete this lesson?')) return

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`http://localhost:3000/lessons/${lessonId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.ok) {
                alert('Lesson deleted successfully!')
                router.push('/dashboard/teacher/lessons')
            } else {
                alert('Failed to delete lesson')
            }
        } catch (error) {
            console.error('Error deleting lesson:', error)
            alert('Failed to delete lesson')
        }
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2 w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4 w-1/4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-16 bg-gray-300 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="text-red-500 mb-4">❌ {error}</div>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                    >
                        ← Go back
                    </button>
                </div>
            </div>
        )
    }

    if (!lesson) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">Lesson not found</div>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                    >
                        ← Go back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:underline mb-2 flex items-center gap-1"
                    >
                        ← Back to lesson list
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">📚 {lesson.name}</h1>
                    <p className="text-gray-600">Group: {lesson.group?.name || 'No group assigned'}</p>
                </div>
                
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/dashboard/teacher/lessons/${lesson.id}/edit`)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
                    >
                        ✏️ Edit Lesson
                    </button>
                    <button
                        onClick={deleteLesson}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                    >
                        🗑️ Delete Lesson
                    </button>
                </div>
            </div>

            {/* Lesson Content */}
            <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📝 Lesson Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lesson Name
                            </label>
                            <p className="text-gray-900">{lesson.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Group
                            </label>
                            <p className="text-gray-900">{lesson.group?.name || 'No group assigned'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Created By
                            </label>
                            <p className="text-gray-900">{lesson.creator.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Created Date
                            </label>
                            <p className="text-gray-900">{new Date(lesson.createdAt).toLocaleDateString('en-US')}</p>
                        </div>
                    </div>
                </div>

                {/* Lesson Content */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📄 Content</h3>
                    <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap">{lesson.content}</p>
                    </div>
                </div>

                {/* Video Section */}
                {lesson.videoUrl && (
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">🎥 Video</h3>
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                            <video 
                                controls 
                                className="w-full h-full rounded-lg"
                                src={lesson.videoUrl}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>Video available</span>
                            {lesson.videoSize && (
                                <span>Size: {(lesson.videoSize / (1024 * 1024)).toFixed(2)} MB</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="bg-gray-50 border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">🔧 Actions</h3>
                    <div className="flex gap-4">
                        <button
                            onClick={() => router.push(`/dashboard/teacher/groups/${lesson.group?.id}`)}
                            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg"
                            disabled={!lesson.group}
                        >
                            👥 View Group
                        </button>
                        <button
                            onClick={() => router.push(`/dashboard/teacher/lessons/${lesson.id}/upload-video`)}
                            className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg"
                        >
                            📹 {lesson.videoUrl ? 'Update Video' : 'Upload Video'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
