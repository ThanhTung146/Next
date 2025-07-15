'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Homework = {
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
    createdAt: string
}

export default function TeacherHomeworksPage() {
    const router = useRouter()
    const [homeworks, setHomeworks] = useState<Homework[]>([])
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
                    throw new Error('Please log in to access this page.')
                }

                const res = await fetch('http://localhost:3000/homeworks/teacher', {
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
                console.log('Teacher homework data received:', data)
                setHomeworks(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error('Error fetching teacher homeworks:', err)
                setError(err instanceof Error ? err.message : 'Cannot load homework list')
                setHomeworks([])
            } finally {
                setLoading(false)
            }
        }

        fetchHomeworks()
    }, [])

    const deleteHomework = async (homeworkId: number) => {
        if (!confirm('Do you want to delete this homework?')) return

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`http://localhost:3000/homeworks/${homeworkId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.ok) {
                setHomeworks(homeworks.filter(hw => hw.id !== homeworkId))
                alert('Delete successfully!')
            } else {
                alert('Failed to delete homework')
            }
        } catch (error) {
            console.error('Error deleting homework:', error)
            alert('Failed to delete homework')
        }
    }

    const paginated = homeworks.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">📝 Assignment Management</h1>
                <button
                    onClick={() => router.push('/dashboard/teacher/homeworks/create')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
                >
                    ➕ Create
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
            ) : homeworks.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">📭 No assignments yet</div>
                    <p className="text-sm text-gray-400 mb-4">There are currently no assignments assigned..</p>
                    <button
                        onClick={() => router.push('/dashboard/teacher/homeworks/create')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                        📝 Create
                    </button>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {paginated.map((homework) => (
                            <div key={homework.id} className="p-4 border rounded shadow-sm hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-blue-700 text-lg">
                                        {homework.title}
                                    </h3>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => router.push(`/dashboard/teacher/homeworks/${homework.id}`)}
                                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded"
                                        >
                                            👁️ Details
                                        </button>
                                        <button
                                            onClick={() => router.push(`/dashboard/teacher/homeworks/${homework.id}/edit`)}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded"
                                        >
                                            ✏️ Update
                                        </button>
                                        <button
                                            onClick={() => deleteHomework(homework.id)}
                                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded"
                                        >
                                            🗑️ Delete
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-sm mb-2">
                                    {homework.description}
                                </p>

                                <div className="flex justify-between items-center text-sm text-gray-500">
                                    <span>
                                        Due date: {new Date(homework.dueDate).toLocaleDateString('vi-VN')}
                                    </span>
                                    <span>
                                        Created at: {new Date(homework.createdAt).toLocaleDateString('vi-VN')}
                                    </span>
                                </div>

                                {homework.fileUrl && (
                                    <div className="mt-2">
                                        <a
                                            href={homework.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            📎 Attached file
                                        </a>
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
