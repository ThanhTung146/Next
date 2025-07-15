'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { HomeworkStatus, getStatusColor, getStatusText } from '@/types/homework'

type HomeworkDetail = {
    id: number
    title: string
    description: string
    dueDate: string
    fileUrl?: string
    createdAt: string
    createdBy: {
        id: number
        name: string
        email: string
    }
    assignments?: Array<{
        id: number
        status: HomeworkStatus
        submitFileUrl?: string
        submittedAt?: string
        grade?: string
        submissionText?: string
        feedback?: string
        student: {
            id: number
            name: string
            email: string
        }
    }>
}

export default function TeacherHomeworkDetailPage() {
    const params = useParams()
    const router = useRouter()
    const homeworkId = params.id as string

    const [homework, setHomework] = useState<HomeworkDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchHomeworkDetail = async () => {
            try {
                setLoading(true)
                setError('')
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Please log in again')
                }

                const res = await fetch(`http://localhost:3000/homeworks/${homeworkId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (!res.ok) {
                    throw new Error(`Error loading homework: ${res.status}`)
                }

                const data = await res.json()
                setHomework(data)
            } catch (err) {
                console.error('Error fetching homework detail:', err)
                setError(err instanceof Error ? err.message : 'Cannot load homework information')
            } finally {
                setLoading(false)
            }
        }

        if (homeworkId) {
            fetchHomeworkDetail()
        }
    }, [homeworkId])

    const deleteHomework = async () => {
        if (!confirm('Are you sure you want to delete this homework?')) return

        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`http://localhost:3000/homeworks/${homeworkId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.ok) {
                alert('Homework deleted successfully!')
                router.push('/dashboard/teacher/homeworks')
            } else {
                alert('Failed to delete homework')
            }
        } catch (error) {
            console.error('Error deleting homework:', error)
            alert('Failed to delete homework')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return 'text-green-600 bg-green-100'
            case 'GRADED': return 'text-blue-600 bg-blue-100'
            case 'LATE': return 'text-red-600 bg-red-100'
            case 'PENDING':
            default: return 'text-yellow-600 bg-yellow-100'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'SUBMITTED': return '✅ Submitted'
            case 'GRADED': return '🎯 Graded'
            case 'LATE': return '❌ Late'
            case 'PENDING':
            default: return '🕒 Pending'
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

    if (!homework) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">Homework not found</div>
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

    const submittedCount = homework.assignments?.filter(a => a.status === 'submitted' || a.status === 'graded').length || 0
    const totalCount = homework.assignments?.length || 0

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:underline mb-2 flex items-center gap-1"
                    >
                        ← Back to homework list
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">📝 {homework.title}</h1>
                    <p className="text-gray-600">Due: {new Date(homework.dueDate).toLocaleDateString('en-US')}</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/dashboard/teacher/homeworks/${homework.id}/edit`)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2"
                    >
                        ✏️ Edit
                    </button>
                    <button
                        onClick={deleteHomework}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>

            {/* Homework Information */}
            <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📋 Homework Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <p className="text-gray-900">{homework.title}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                            </label>
                            <p className="text-gray-900">{new Date(homework.dueDate).toLocaleDateString('en-US')}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Created By
                            </label>
                            <p className="text-gray-900">{homework.createdBy.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Created Date
                            </label>
                            <p className="text-gray-900">{new Date(homework.createdAt).toLocaleDateString('en-US')}</p>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📄 Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{homework.description}</p>
                </div>

                {/* Attachment */}
                {homework.fileUrl && (
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">📎 Attachment</h3>
                        <div className="space-y-4">
                            {/* File Info */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl">
                                    {homework.fileUrl.toLowerCase().includes('.pdf') ? '📄' :
                                     homework.fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? '🖼️' :
                                     homework.fileUrl.toLowerCase().match(/\.(doc|docx)$/i) ? '📝' :
                                     homework.fileUrl.toLowerCase().match(/\.(xls|xlsx)$/i) ? '📊' :
                                     homework.fileUrl.toLowerCase().match(/\.(ppt|pptx)$/i) ? '📽️' :
                                     '📁'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        {homework.fileUrl.split('/').pop()?.split('?')[0] || 'Homework Attachment'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {homework.fileUrl.toLowerCase().includes('.pdf') ? 'PDF Document' :
                                         homework.fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? 'Image File' :
                                         homework.fileUrl.toLowerCase().match(/\.(doc|docx)$/i) ? 'Word Document' :
                                         homework.fileUrl.toLowerCase().match(/\.(xls|xlsx)$/i) ? 'Excel Spreadsheet' :
                                         homework.fileUrl.toLowerCase().match(/\.(ppt|pptx)$/i) ? 'PowerPoint Presentation' :
                                         'File Attachment'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => window.open(homework.fileUrl, '_blank')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                                >
                                    �️ Preview
                                </button>
                                <a
                                    href={homework.fileUrl}
                                    download
                                    className="inline-flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                                >
                                    📥 Download
                                </a>
                            </div>

                            {/* Inline Preview for Images and PDFs */}
                            {homework.fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                    <div className="border rounded-lg p-2 bg-gray-50">
                                        <img
                                            src={homework.fileUrl}
                                            alt="Homework attachment preview"
                                            className="max-w-full h-auto max-h-96 mx-auto rounded"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {homework.fileUrl.toLowerCase().includes('.pdf') && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                    <div className="border rounded-lg overflow-hidden">
                                        <iframe
                                            src={`${homework.fileUrl}#toolbar=0`}
                                            className="w-full h-96"
                                            title="PDF Preview"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Submission Statistics */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📊 Submission Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{totalCount}</div>
                            <div className="text-sm text-blue-600">Total Students</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{submittedCount}</div>
                            <div className="text-sm text-green-600">Submitted</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-red-600">{totalCount - submittedCount}</div>
                            <div className="text-sm text-red-600">Pending</div>
                        </div>
                    </div>
                </div>

                {/* Student Submissions */}
                {homework.assignments && homework.assignments.length > 0 && (
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">👥 Student Submissions</h3>
                        <div className="space-y-4">
                            {homework.assignments.map((assignment) => (
                                <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-medium text-gray-900">{assignment.student.name}</h4>
                                            <p className="text-sm text-gray-500">{assignment.student.email}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                            {getStatusText(assignment.status)}
                                        </span>
                                    </div>

                                    {assignment.submittedAt && (
                                        <p className="text-xs text-gray-500 mb-2">
                                            Submitted: {new Date(assignment.submittedAt).toLocaleString('en-US')}
                                        </p>
                                    )}

                                    {assignment.grade && (
                                        <p className="text-sm font-medium text-blue-600 mb-2">
                                            Grade: {assignment.grade}
                                        </p>
                                    )}

                                    {assignment.submitFileUrl && (
                                        <a
                                            href={assignment.submitFileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-sm text-blue-600 hover:underline"
                                        >
                                            📄 View Submission
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
