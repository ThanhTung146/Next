export enum HomeworkStatus {
    PENDING = 'pending',
    SUBMITTED = 'submitted',
    LATE = 'late',
    GRADED = 'graded'
}

export type HomeworkAssignment = {
    id: number
    status: HomeworkStatus
    submitFileUrl?: string
    submittedAt?: string
    gradedAt?: string
    grade?: string
    submissionText?: string
    feedback?: string
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
        createdAt: string
    }
}

export const getStatusColor = (status: HomeworkStatus): string => {
    switch (status) {
        case HomeworkStatus.SUBMITTED:
            return 'text-green-600 bg-green-100'
        case HomeworkStatus.GRADED:
            return 'text-blue-600 bg-blue-100'
        case HomeworkStatus.LATE:
            return 'text-red-600 bg-red-100'
        case HomeworkStatus.PENDING:
        default:
            return 'text-yellow-600 bg-yellow-100'
    }
}

export const getStatusText = (status: HomeworkStatus): string => {
    switch (status) {
        case HomeworkStatus.SUBMITTED:
            return '✅ Submitted'
        case HomeworkStatus.GRADED:
            return '🎯 Graded'
        case HomeworkStatus.LATE:
            return '❌ Late'
        case HomeworkStatus.PENDING:
        default:
            return '🕒 Not submitted'
    }
}
