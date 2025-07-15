'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

type Student = {
    id: number
    name: string
    email: string
}

type Teacher = {
    id: number
    name: string
    email: string
}

type Lesson = {
    id: number
    title: string
    description: string
    videoUrl?: string
    createdAt: string
}

type GroupDetail = {
    id: number
    name: string
    students: Student[]
    teacher: Teacher
    lessons?: Lesson[]
    homeworks?: any[] // Assuming homeworks is an array of objects
}

export default function TeacherGroupDetailPage() {
    const params = useParams()
    const router = useRouter()
    const groupId = params.id as string

    const [group, setGroup] = useState<GroupDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState<'info' | 'students' | 'lessons'>('info')

    useEffect(() => {
        const fetchGroupDetail = async () => {
            try {
                setLoading(true)
                setError('')
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Please log in again')
                }

                const res = await fetch(`http://localhost:3000/groups/${groupId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (!res.ok) {
                    throw new Error(`Error loading group information: ${res.status}`)
                }

                const data = await res.json()
                setGroup(data)
            } catch (err) {
                console.error('Error fetching group detail:', err)
                setError(err instanceof Error ? err.message : 'Cannot load group information')
            } finally {
                setLoading(false)
            }
        }

        if (groupId) {
            fetchGroupDetail()
        }
    }, [groupId])

    const handleCreateLesson = () => {
        // Navigate to create lesson page with group ID
        router.push(`/dashboard/teacher/lessons/create?groupId=${groupId}`)
    }

    const handleCreateHomework = () => {
        // Navigate to create homework page with group ID
        router.push(`/dashboard/teacher/homeworks/create?groupId=${groupId}`)
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

    if (!group) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">Group information not found</div>
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
                        ← Back to group list
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">📚 {group.name}</h1>
                    <p className="text-gray-600">Teacher: {group.teacher.name}</p>
                </div>

                {/* Action buttons for teacher */}
                <div className="flex gap-2">
                    <button
                        onClick={handleCreateLesson}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
                    >
                        📚 Create Lesson
                    </button>
                    <button
                        onClick={handleCreateHomework}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center gap-2"
                    >
                        📝 Assign Homework
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'info'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        📋 General Information
                    </button>
                    <button
                        onClick={() => setActiveTab('students')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'students'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        👥 Student List ({group.students.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('lessons')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'lessons'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        🎥 Lessons ({group.lessons?.length || 0})
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'info' && (
                <div className="space-y-6">
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">📝 Group Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Group Name
                                </label>
                                <p className="text-gray-900">{group.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teacher
                                </label>
                                <p className="text-gray-900">{group.teacher.name}</p>
                                <p className="text-sm text-gray-500">{group.teacher.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Students
                                </label>
                                <p className="text-gray-900">{group.students.length} students</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Number of Lessons
                                </label>
                                <p className="text-gray-900">{group.lessons?.length || 0} lessons</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">👥</span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-blue-900">Students</p>
                                    <p className="text-2xl font-bold text-blue-600">{group.students.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">🎥</span>
                                    </div>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-900">Lessons</p>
                                    <p className="text-2xl font-bold text-green-600">{group.lessons?.length || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'students' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">👥 Student List</h3>
                        <button
                            onClick={() => router.push(`/dashboard/teacher/groups/${groupId}/add-students`)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                        >
                            ➕ Add Students
                        </button>
                    </div>
                    <div className="bg-white border rounded-lg divide-y">
                        {group.students.map((student, index) => (
                            <div key={student.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-blue-600 font-medium text-sm">
                                                {index + 1}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{student.name}</p>
                                        <p className="text-sm text-gray-500">{student.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => router.push(`/dashboard/teacher/students/${student.id}`)}
                                        className="text-blue-600 hover:underline text-sm"
                                    >
                                        View Details
                                    </button>
                                    <button className="text-red-600 hover:underline text-sm">
                                        Remove from Group
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'lessons' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">🎥 Lesson List</h3>
                        <button
                            onClick={handleCreateLesson}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                        >
                            ➕ Create
                        </button>
                    </div>
                    {group.lessons && group.lessons.length > 0 ? (
                        <div className="space-y-4">
                            {group.lessons.map((lesson, index) => (
                                <div key={lesson.id} className="bg-white border rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                                    Lesson {index + 1}
                                                </span>
                                                {lesson.videoUrl && (
                                                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                                        📹 Has Video
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                {lesson.title}
                                            </h4>
                                            <p className="text-gray-600 text-sm mb-2">
                                                {lesson.description}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Created: {new Date(lesson.createdAt).toLocaleDateString('en-US')}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                            {lesson.videoUrl && (
                                                <button
                                                    onClick={() => window.open(lesson.videoUrl, '_blank')}
                                                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                                                >
                                                    🎥 Watch Video
                                                </button>
                                            )}
                                            <button
                                                onClick={() => router.push(`/dashboard/teacher/lessons/${lesson.id}/edit`)}
                                                className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded">
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-gray-500 mb-2">📭 No lessons yet</div>
                            <p className="text-sm text-gray-400 mb-4">You have not created any lessons for this group yet</p>
                            <button
                                onClick={handleCreateLesson}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                            >
                                📚 Create
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
