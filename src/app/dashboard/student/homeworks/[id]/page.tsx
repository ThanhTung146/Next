'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { HomeworkStatus, HomeworkAssignment, getStatusColor, getStatusText } from '@/types/homework'

export default function StudentHomeworkDetailPage() {
    const params = useParams()
    const router = useRouter()
    const homeworkId = params.id as string

    const [assignment, setAssignment] = useState<HomeworkAssignment | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    useEffect(() => {
        const fetchHomeworkDetail = async () => {
            try {
                setLoading(true)
                setError('')
                const token = localStorage.getItem('token')

                if (!token) {
                    throw new Error('Please log in again')
                }

                const res = await fetch(`http://localhost:3000/homeworks/assignment/${homeworkId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                })

                if (!res.ok) {
                    throw new Error(`Error loading homework: ${res.status}`)
                }

                const data = await res.json()
                setAssignment(data)
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
        }
    }

    const handleSubmit = async () => {
        if (!selectedFile) {
            alert('Please select a file to submit')
            return
        }

        try {
            setSubmitting(true)
            const token = localStorage.getItem('token')
            const formData = new FormData()
            formData.append('file', selectedFile)

            const res = await fetch(`http://localhost:3000/homeworks/submit/${assignment?.id}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            })

            if (res.ok) {
                alert('Homework submitted successfully!')
                // Refresh the assignment data
                window.location.reload()
            } else {
                const error = await res.text()
                alert(`Error: ${error}`)
            }
        } catch (error) {
            console.error('Error submitting homework:', error)
            alert('Failed to submit homework')
        } finally {
            setSubmitting(false)
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

    if (!assignment) {
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

    const isOverdue = new Date() > new Date(assignment.homework.dueDate)
    const canSubmit = assignment.status === HomeworkStatus.PENDING && !isOverdue

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
                    <h1 className="text-2xl font-bold text-gray-800">📝 {assignment.homework.title}</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <p className="text-gray-600">Due: {new Date(assignment.homework.dueDate).toLocaleDateString('en-US')}</p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {getStatusText(assignment.status)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Homework Information */}
            <div className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📋 Assignment Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Title
                            </label>
                            <p className="text-gray-900">{assignment.homework.title}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                            </label>
                            <p className={`${isOverdue ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                {new Date(assignment.homework.dueDate).toLocaleDateString('en-US')}
                                {isOverdue && ' (Overdue)'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Teacher
                            </label>
                            <p className="text-gray-900">{assignment.homework.createdBy.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                {getStatusText(assignment.status)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📄 Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{assignment.homework.description}</p>
                </div>

                {/* Teacher's Attachment */}
                {assignment.homework.fileUrl && (
                    <div className="bg-white border rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">📎 Teacher's Attachment</h3>
                        <div className="space-y-4">
                            {/* File Info */}
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="text-2xl">
                                    {assignment.homework.fileUrl.toLowerCase().includes('.pdf') ? '📄' :
                                     assignment.homework.fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? '🖼️' :
                                     assignment.homework.fileUrl.toLowerCase().match(/\.(doc|docx)$/i) ? '📝' :
                                     assignment.homework.fileUrl.toLowerCase().match(/\.(xls|xlsx)$/i) ? '📊' :
                                     assignment.homework.fileUrl.toLowerCase().match(/\.(ppt|pptx)$/i) ? '📽️' :
                                     '📁'}
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900">
                                        {assignment.homework.fileUrl.split('/').pop()?.split('?')[0] || 'Attachment'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {assignment.homework.fileUrl.toLowerCase().includes('.pdf') ? 'PDF Document' :
                                         assignment.homework.fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? 'Image File' :
                                         assignment.homework.fileUrl.toLowerCase().match(/\.(doc|docx)$/i) ? 'Word Document' :
                                         assignment.homework.fileUrl.toLowerCase().match(/\.(xls|xlsx)$/i) ? 'Excel Spreadsheet' :
                                         assignment.homework.fileUrl.toLowerCase().match(/\.(ppt|pptx)$/i) ? 'PowerPoint Presentation' :
                                         'File Attachment'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => window.open(assignment.homework.fileUrl, '_blank')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                                >
                                    �️ Preview
                                </button>
                                <a
                                    href={assignment.homework.fileUrl}
                                    download
                                    className="inline-flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                                >
                                    📥 Download
                                </a>
                            </div>

                            {/* Inline Preview for Images and PDFs */}
                            {assignment.homework.fileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                    <div className="border rounded-lg p-2 bg-gray-50">
                                        <img
                                            src={assignment.homework.fileUrl}
                                            alt="Teacher's attachment preview"
                                            className="max-w-full h-auto max-h-96 mx-auto rounded"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}

                            {assignment.homework.fileUrl.toLowerCase().includes('.pdf') && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                                    <div className="border rounded-lg overflow-hidden">
                                        <iframe
                                            src={`${assignment.homework.fileUrl}#toolbar=0`}
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

                {/* Submission Section */}
                <div className="bg-white border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">📤 Your Submission</h3>

                    {assignment.status === HomeworkStatus.PENDING ? (
                        canSubmit ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Select file to submit
                                    </label>
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!selectedFile || submitting}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Homework'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-red-600 font-medium">⏰ Submission deadline has passed</p>
                                <p className="text-gray-500 text-sm mt-1">You can no longer submit this homework</p>
                            </div>
                        )
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-green-800 font-medium">✅ Homework submitted successfully!</p>
                                {assignment.submittedAt && (
                                    <p className="text-green-600 text-sm mt-1">
                                        Submitted on: {new Date(assignment.submittedAt).toLocaleString('en-US')}
                                    </p>
                                )}
                            </div>

                            {assignment.submitFileUrl && (
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <div className="text-2xl">
                                            {assignment.submitFileUrl.toLowerCase().includes('.pdf') ? '📄' :
                                             assignment.submitFileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? '🖼️' :
                                             assignment.submitFileUrl.toLowerCase().match(/\.(doc|docx)$/i) ? '📝' :
                                             assignment.submitFileUrl.toLowerCase().match(/\.(xls|xlsx)$/i) ? '📊' :
                                             assignment.submitFileUrl.toLowerCase().match(/\.(ppt|pptx)$/i) ? '📽️' :
                                             '📁'}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">Your Submission</p>
                                            <p className="text-sm text-gray-500">
                                                {assignment.submitFileUrl.toLowerCase().includes('.pdf') ? 'PDF Document' :
                                                 assignment.submitFileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) ? 'Image File' :
                                                 assignment.submitFileUrl.toLowerCase().match(/\.(doc|docx)$/i) ? 'Word Document' :
                                                 assignment.submitFileUrl.toLowerCase().match(/\.(xls|xlsx)$/i) ? 'Excel Spreadsheet' :
                                                 assignment.submitFileUrl.toLowerCase().match(/\.(ppt|pptx)$/i) ? 'PowerPoint Presentation' :
                                                 'File Attachment'}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={() => window.open(assignment.submitFileUrl, '_blank')}
                                            className="inline-flex items-center px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                                        >
                                            �️ Preview Submission
                                        </button>
                                        <a
                                            href={assignment.submitFileUrl}
                                            download
                                            className="inline-flex items-center px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                                        >
                                            📥 Download Submission
                                        </a>
                                    </div>

                                    {/* Inline Preview for Images */}
                                    {assignment.submitFileUrl.toLowerCase().match(/\.(jpg|jpeg|png|gif)$/i) && (
                                        <div className="mt-3">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Submission Preview:</p>
                                            <div className="border rounded-lg p-2 bg-gray-50">
                                                <img
                                                    src={assignment.submitFileUrl}
                                                    alt="Submission preview"
                                                    className="max-w-full h-auto max-h-64 mx-auto rounded"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {assignment.status === HomeworkStatus.GRADED && assignment.grade && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-blue-800 font-medium">🎯 Grade: {assignment.grade}</p>
                                    {assignment.gradedAt && (
                                        <p className="text-blue-600 text-sm mt-1">
                                            Graded on: {new Date(assignment.gradedAt).toLocaleString('en-US')}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
