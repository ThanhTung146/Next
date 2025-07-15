'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type User = {
    id: number
    name: string
    email: string
    role: string
}

export default function CreateGroupPage() {
    const router = useRouter()
    const [students, setStudents] = useState<User[]>([])
    const [selectedStudents, setSelectedStudents] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingStudents, setLoadingStudents] = useState(true)
    const [groupName, setGroupName] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch('http://localhost:3000/users', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })

                if (res.ok) {
                    const data = await res.json()
                    // Filter only students
                    const studentsOnly = data.filter((user: User) => user.role === 'student')
                    setStudents(studentsOnly)
                }
            } catch (error) {
                console.error('Error fetching students:', error)
            } finally {
                setLoadingStudents(false)
            }
        }

        fetchStudents()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (selectedStudents.length === 0) {
            alert('Please select at least one student')
            return
        }

        setLoading(true)

        try {
            const token = localStorage.getItem('token')
            const res = await fetch('http://localhost:3000/groups', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: groupName,
                    studentsId: selectedStudents,
                }),
            })

            if (res.ok) {
                alert('Group created successfully!')
                router.push('/dashboard/teacher/groups')
            } else {
                const error = await res.text()
                alert(`Error: ${error}`)
            }
        } catch (error) {
            console.error('Error creating group:', error)
            alert('An error occurred while creating the group')
        } finally {
            setLoading(false)
        }
    }

    const toggleStudent = (studentId: number) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        )
    }

    const selectAll = () => {
        const filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())
        )

        const allSelected = filteredStudents.every(student => selectedStudents.includes(student.id))

        if (allSelected) {
            setSelectedStudents(prev => prev.filter(id => !filteredStudents.map(s => s.id).includes(id)))
        } else {
            const newSelections = filteredStudents.map(s => s.id)
            setSelectedStudents(prev => [...new Set([...prev, ...newSelections])])
        }
    }

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:underline mr-4"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold text-gray-800">👥 Create</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Group information</h2>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Group name *
                        </label>
                        <input
                            type="text"
                            required
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập tên nhóm (VD: Lớp Toán 12A1)"
                        />
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Select students</h2>
                        <button
                            type="button"
                            onClick={selectAll}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            {filteredStudents.every(s => selectedStudents.includes(s.id))
                                ? 'Deselect all'
                                : 'Select all'
                            }
                        </button>
                    </div>

                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {loadingStudents ? (
                        <p>Loading...</p>
                    ) : filteredStudents.length === 0 ? (
                        <p className="text-gray-500">
                            {searchTerm ? 'No students found' : 'No students available'}
                        </p>
                    ) : (
                        <div className="max-h-96 overflow-y-auto border border-gray-200 rounded">
                            <div className="divide-y divide-gray-200">
                                {filteredStudents.map((student) => (
                                    <label
                                        key={student.id}
                                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={() => toggleStudent(student.id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                            <p className="text-xs text-gray-500">{student.email}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedStudents.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                                Selected: {selectedStudents.length} students
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !groupName.trim() || selectedStudents.length === 0}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Created Group'}
                    </button>
                </div>
            </form>
        </div>
    )
}
