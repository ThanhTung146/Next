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

export default function StudentLessonDetailPage() {
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

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded mb-4 w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2 w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded mb-4 w-1/4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-gray-300 rounded"></div>
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
                        ← Back to lessons
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">📚 {lesson.name}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-gray-600">👨‍🏫 {lesson.creator.name}</p>
                        <p className="text-gray-600">📝 Group: {lesson.group?.name || 'No group assigned'}</p>
                        <p className="text-gray-600">📅 {new Date(lesson.createdAt).toLocaleDateString('en-US')}</p>
                        {lesson.videoSize && (
                            <p className="text-gray-600">📊 {(lesson.videoSize / (1024 * 1024)).toFixed(1)} MB</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Lesson Content */}
            <div className="space-y-6">
                {/* Video Section */}
                {lesson.videoUrl && (
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">🎬 Lesson Video</h3>
                        <div className="space-y-4">
                            {/* Video Info */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl">🎥</div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">Video Lesson</p>
                                    <p className="text-sm text-gray-500">
                                        {lesson.videoSize ? `${(lesson.videoSize / (1024 * 1024)).toFixed(1)} MB` : 'Video content available'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Video Player */}
                            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                <video
                                    controls
                                    className="w-full h-full"
                                    preload="metadata"
                                    onError={(e) => {
                                        console.error('Video load error:', e);
                                    }}
                                >
                                    <source src={lesson.videoUrl} type="video/mp4" />
                                    <p className="text-center text-gray-500 p-8">
                                        Your browser does not support the video tag.
                                        <br />
                                        <a 
                                            href={lesson.videoUrl} 
                                            target="_blank" 
                                            className="text-blue-600 hover:underline"
                                        >
                                            Click here to watch the video in a new tab
                                        </a>
                                    </p>
                                </video>
                            </div>

                            {/* Video Actions */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => window.open(lesson.videoUrl, '_blank')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                                >
                                    🎬 Open in New Tab
                                </button>
                                <a
                                    href={lesson.videoUrl}
                                    download
                                    className="inline-flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                                >
                                    📥 Download Video
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Lesson Information */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📋 Lesson Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <p className="text-gray-900">{lesson.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teacher
                            </label>
                            <p className="text-gray-900">{lesson.creator.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Group
                            </label>
                            <p className="text-gray-900">{lesson.group?.name || 'No group assigned'}</p>
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
                    <h3 className="text-lg font-semibold mb-4">📄 Lesson Content</h3>
                    <div className="prose max-w-none">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {lesson.content}
                        </p>
                    </div>
                </div>

                {/* Additional Resources */}
                {!lesson.videoUrl && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-600">ℹ️</span>
                            <p className="text-yellow-800 font-medium">No video available</p>
                        </div>
                        <p className="text-yellow-700 text-sm mt-1">
                            This lesson contains text content only. Your teacher may add a video later.
                        </p>
                    </div>
                )}

                {/* Study Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600">💡</span>
                        <p className="text-blue-800 font-medium">Study Tips</p>
                    </div>
                    <ul className="text-blue-700 text-sm space-y-1 ml-6">
                        <li>• Take notes while watching the video</li>
                        <li>• You can pause and rewind as needed</li>
                        <li>• Review the lesson content multiple times</li>
                        <li>• Ask your teacher if you have questions</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
