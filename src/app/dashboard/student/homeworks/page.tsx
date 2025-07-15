'use client'

import { useEffect, useState } from 'react'

type HomeworkAssignment = {
    id: number
    status: 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED'
    submitFileUrl?: string
    submittedAt?: string
    gradedAt?: string
    grade?: string
    homework: {
        id: number
        title: string
        description: string
        dueDate: string
        fileUrl?: string
        createdBy: {
            id: number
            name: string
            email: string
        }
    }
}

export default function StudentHomeworksPage() {
    const [homeworks, setHomeworks] = useState<HomeworkAssignment[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const pageSize = 5

    useEffect(() => {
        const fetchHomeworks = async () => {
            try {
                setLoading(true)
                setError('')
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Please log in again')
                }

                const res = await fetch('http://localhost:3000/homeworks/student', {
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
                console.log('Homework data received:', data)
                setHomeworks(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Error fetching homeworks:', err)
                setError(err instanceof Error ? err.message : 'Cannot load homework list')
                setHomeworks([]) // Ensure homeworks is always an array
            } finally {
                setLoading(false)
            }
        }

        fetchHomeworks()
    }, [])

    const retryFetch = () => {
        const fetchHomeworks = async () => {
            try {
                setLoading(true)
                setError('')
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Please log in again')
                }

                const res = await fetch('http://localhost:3000/homeworks/student', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (!res.ok) {
                    throw new Error(`Server error: ${res.status}`)
                }

                const data = await res.json()
                console.log('Retry - Homework data received:', data)
                console.log('Retry - Number of items:', data.length)
                setHomeworks(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Error retrying fetch:', err)
                setError(err instanceof Error ? err.message : 'Cannot load homework list')
                setHomeworks([])
            } finally {
                setLoading(false)
            }
        }

        fetchHomeworks()
    }

    const paginated = homeworks.slice((page - 1) * pageSize, page * pageSize)

    const renderStatus = (assignment: HomeworkAssignment) => {
        const now = new Date()
        const dueDate = new Date(assignment.homework.dueDate)

        switch (assignment.status) {
            case 'SUBMITTED':
                return '✅ Submitted'
            case 'GRADED':
                return `🎯 Graded${assignment.grade ? ` (${assignment.grade})` : ''}`
            case 'LATE':
                return '❌ Late submission'
            case 'PENDING':
            default:
                if (now > dueDate) {
                    return '⏰ Overdue'
                }
                return '🕒 Not submitted'
        }
    }

    const getStatusColor = (assignment: HomeworkAssignment) => {
        switch (assignment.status) {
            case 'SUBMITTED':
                return 'text-green-600'
            case 'GRADED':
                return 'text-blue-600'
            case 'LATE':
                return 'text-red-600'
            case 'PENDING':
            default:
                const now = new Date()
                const dueDate = new Date(assignment.homework.dueDate)
                return now > dueDate ? 'text-red-600' : 'text-yellow-600'
        }
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📚 Homework List</h1>
                {error && (
                    <button
                        onClick={retryFetch}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded"
                    >
                        🔄 Retry
                    </button>
                )}
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
                        onClick={retryFetch}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                    >
                        🔄 Retry
                    </button>
                </div>
            ) : homeworks.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">📭 No homework yet</div>
                    <p className="text-sm text-gray-400">Your teacher has not assigned any homework yet</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {paginated.map((assignment) => (
                            <div key={assignment.id} className="p-4 border rounded shadow-sm hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-blue-700 text-lg">
                                        {assignment.homework.title}
                                    </h3>
                                    <span className={`text-sm font-medium ${getStatusColor(assignment)}`}>
                                        {renderStatus(assignment)}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-2">
                                    {assignment.homework.description}
                                </p>

                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>
                                        Due date: {new Date(assignment.homework.dueDate).toLocaleDateString('en-US')}
                                    </span>
                                    <span>
                                        Teacher: {assignment.homework.createdBy.name}
                                    </span>
                                </div>

                                {assignment.homework.fileUrl && (
                                    <div className="mt-2">
                                        <a
                                            href={assignment.homework.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            📎 Download attachment
                                        </a>
                                    </div>
                                )}

                                {assignment.submitFileUrl && (
                                    <div className="mt-2">
                                        <a
                                            href={assignment.submitFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-green-600 hover:underline text-sm"
                                        >
                                            📄 View your submission
                                        </a>
                                    </div>
                                )}

                                {assignment.submittedAt && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        Submitted at: {new Date(assignment.submittedAt).toLocaleString('en-US')}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {Math.ceil(homeworks.length / pageSize) > 1 && (
                        <div className="mt-6 flex justify-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ←
                            </button>

                            {Array.from({ length: Math.ceil(homeworks.length / pageSize) }).map((_, i) => (
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
                                onClick={() => setPage(Math.min(Math.ceil(homeworks.length / pageSize), page + 1))}
                                disabled={page === Math.ceil(homeworks.length / pageSize)}
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
