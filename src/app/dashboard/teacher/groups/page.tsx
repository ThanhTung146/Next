'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Group = {
    id: number
    name: string
    students: any[]
}

export default function TeacherGroupsPage() {
    const router = useRouter()
    const [groups, setGroups] = useState<Group[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [page, setPage] = useState(1)
    const pageSize = 5

    const fetchGroups = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const teacherId = localStorage.getItem('id')

            const res = await fetch('http://localhost:3000/groups/teacher', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teacherId }),
            })
            if (!res.ok) throw new Error('Error loading groups list')

            const data = await res.json()
            setGroups(Array.isArray(data) ? data : [])
        } catch (e) {
            setError('Unable to load groups.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGroups()
    }, [])

    const paginated = groups.slice((page - 1) * pageSize, page * pageSize)

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">📋 Groups management</h2>
                <button
                    onClick={() => router.push('/dashboard/teacher/groups/create')}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
                >
                    ➕ Create New Group
                </button>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : groups.length === 0 ? (
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-2">📭 No groups yet</div>
                    <p className="text-sm text-gray-400 mb-4">You haven't created any groups</p>
                    <button
                        onClick={() => router.push('/dashboard/teacher/groups/create')}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                    >
                        👥 Create
                    </button>
                </div>
            ) : (
                <>
                    <div className="border rounded shadow-sm divide-y">
                        {paginated.map((group) => (
                            <div
                                key={group.id}
                                className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                onDoubleClick={() => router.push(`/dashboard/teacher/groups/${group.id}`)}
                            >
                                <div>
                                    <h3 className="font-semibold text-blue-600">{group.name}</h3>
                                    <p className="text-xs text-gray-500">{group.students.length} students</p>
                                </div>
                                <button
                                    onClick={() => router.push(`/dashboard/teacher/groups/${group.id}`)}
                                    className="text-sm text-blue-500 hover:underline"
                                >
                                    Details →
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex justify-center gap-2">
                        {Array.from({ length: Math.ceil(groups.length / pageSize) }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
