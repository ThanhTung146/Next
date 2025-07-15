'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Group = {
    id: number
    name: string
    students: { id: number; name: string }[]
}

export default function CreateHomeworkPage() {
    const router = useRouter()
    const [groups, setGroups] = useState<Group[]>([])
    const [selectedStudents, setSelectedStudents] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const [loadingGroups, setLoadingGroups] = useState(true)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
    })
    const [file, setFile] = useState<File | null>(null)

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const token = localStorage.getItem('token')
                const res = await fetch('http://localhost:3000/groups/teacher', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (res.ok) {
                    const data = await res.json()
                    setGroups(Array.isArray(data) ? data : [])
                }
            } catch (error) {
                console.error('Error fetching groups:', error)
            } finally {
                setLoadingGroups(false)
            }
        }

        fetchGroups()
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
            const formDataToSend = new FormData()
            
            formDataToSend.append('title', formData.title)
            formDataToSend.append('description', formData.description)
            
            // Ensure dueDate is in ISO format
            let dueDateISO: string
            try {
                // If it's already a valid date string, convert it to ISO
                dueDateISO = new Date(formData.dueDate).toISOString()
            } catch (error) {
                console.error('Error converting date to ISO format:', error)
                alert('Invalid date format. Please select a valid date.')
                setLoading(false)
                return
            }
            
            formDataToSend.append('dueDate', dueDateISO)
            
            // Gửi studentIds như một JSON string
            formDataToSend.append('studentIds', JSON.stringify(selectedStudents))
            
            if (file) {
                formDataToSend.append('file', file)
            }

            const res = await fetch('http://localhost:3000/homeworks', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formDataToSend,
            })

            if (res.ok) {
                alert('Successfully!')
                router.push('/dashboard/teacher/homeworks')
            } else {
                const error = await res.text()
                alert(`Lỗi: ${error}`)
            }
        } catch (error) {
            console.error('Error creating homework:', error)
            alert('Failed to create homework')
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

    const selectAllFromGroup = (groupStudents: { id: number }[]) => {
        const studentIds = groupStudents.map(s => s.id)
        const allSelected = studentIds.every(id => selectedStudents.includes(id))
        
        if (allSelected) {
            setSelectedStudents(prev => prev.filter(id => !studentIds.includes(id)))
        } else {
            setSelectedStudents(prev => [...new Set([...prev, ...studentIds])])
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-blue-600 hover:underline mr-4"
                >
                    ← Back
                </button>
                <h1 className="text-2xl font-bold text-gray-800">📝 Create</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Assignment details</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Nhập tiêu đề bài tập"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Due date *
                            </label>
                            <input
                                type="datetime-local"
                                required
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            required
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Nhập mô tả chi tiết về bài tập"
                        />
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Attached file (optional)
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Supported: PDF, DOC, DOCX, TXT, JPG, PNG
                        </p>
                    </div>
                </div>

                <div className="bg-white border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Select students</h2>
                    
                    {loadingGroups ? (
                        <p>Loading...</p>
                    ) : groups.length === 0 ? (
                        <p className="text-gray-500">No groups found</p>
                    ) : (
                        <div className="space-y-4">
                            {groups.map((group) => (
                                <div key={group.id} className="border border-gray-200 rounded p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium text-gray-900">
                                            📚 {group.name} ({group.students.length} students)
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => selectAllFromGroup(group.students)}
                                            className="text-sm text-blue-600 hover:underline"
                                        >
                                            {group.students.every(s => selectedStudents.includes(s.id)) 
                                                ? 'Deselect all' 
                                                : 'Select all'
                                            }
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                        {group.students.map((student) => (
                                            <label
                                                key={student.id}
                                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={() => toggleStudent(student.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">{student.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
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
                        disabled={loading}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </form>
        </div>
    )
}
