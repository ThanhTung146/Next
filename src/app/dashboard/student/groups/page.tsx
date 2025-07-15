'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Group = {
    id: number
    name: string
    students: any[]
    teacher?: {
        id: number
        name: string
        email: string
    }
}

export default function StudentGroupsPage() {
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
            const studentId = localStorage.getItem('id')

            const res = await fetch('http://localhost:3000/groups/student', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId }),
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
            <h2 className="text-xl font-bold mb-4">📋 My groups</h2>

            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <>
                    <div className="border rounded shadow-sm divide-y">
                        {paginated.map((group) => (
                            <div
                                key={group.id}
                                className="p-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                                onDoubleClick={() => router.push(`/dashboard/student/groups/${group.id}`)}
                            >
                                <div>
                                    <h3 className="font-semibold text-blue-600">{group.name}</h3>
                                    <p className="text-xs text-gray-500">Teacher: {group.teacher?.name || ''}</p>
                                </div>

                                <button
                                    onClick={() => router.push(`/dashboard/student/groups/${group.id}`)}
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
