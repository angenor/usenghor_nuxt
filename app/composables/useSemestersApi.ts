import type {
  PaginatedResponse,
  ProgramSemesterRead,
  ProgramSemesterWithCourses,
  ProgramSemesterCreatePayload,
  ProgramSemesterUpdatePayload,
  ProgramCourseRead,
  ProgramCourseCreatePayload,
  ProgramCourseUpdatePayload,
  IdResponse,
  MessageResponse,
} from '~/types/api'

export function useSemestersApi() {
  const { apiFetch } = useApi()

  // =========================================================================
  // Semesters CRUD
  // =========================================================================

  async function listSemesters(params: {
    program_id?: string
    page?: number
    limit?: number
  } = {}): Promise<PaginatedResponse<ProgramSemesterRead>> {
    return apiFetch<PaginatedResponse<ProgramSemesterRead>>('/api/admin/program-semesters', {
      query: {
        program_id: params.program_id || undefined,
        page: params.page || 1,
        limit: params.limit || 100,
      },
    })
  }

  async function getSemesterById(id: string): Promise<ProgramSemesterWithCourses> {
    return apiFetch<ProgramSemesterWithCourses>(`/api/admin/program-semesters/${id}`)
  }

  async function createSemester(data: ProgramSemesterCreatePayload): Promise<IdResponse> {
    return apiFetch<IdResponse>('/api/admin/program-semesters', {
      method: 'POST',
      body: data,
    })
  }

  async function updateSemester(id: string, data: ProgramSemesterUpdatePayload): Promise<ProgramSemesterRead> {
    return apiFetch<ProgramSemesterRead>(`/api/admin/program-semesters/${id}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteSemester(id: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/program-semesters/${id}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Courses CRUD
  // =========================================================================

  async function getCoursesBySemester(semesterId: string): Promise<ProgramCourseRead[]> {
    return apiFetch<ProgramCourseRead[]>(`/api/admin/program-semesters/${semesterId}/courses`)
  }

  async function createCourse(semesterId: string, data: ProgramCourseCreatePayload): Promise<IdResponse> {
    return apiFetch<IdResponse>(`/api/admin/program-semesters/${semesterId}/courses`, {
      method: 'POST',
      body: data,
    })
  }

  async function updateCourse(semesterId: string, courseId: string, data: ProgramCourseUpdatePayload): Promise<ProgramCourseRead> {
    return apiFetch<ProgramCourseRead>(`/api/admin/program-semesters/${semesterId}/courses/${courseId}`, {
      method: 'PUT',
      body: data,
    })
  }

  async function deleteCourse(semesterId: string, courseId: string): Promise<MessageResponse> {
    return apiFetch<MessageResponse>(`/api/admin/program-semesters/${semesterId}/courses/${courseId}`, {
      method: 'DELETE',
    })
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  function getSemesterDisplayName(semester: ProgramSemesterRead): string {
    if (semester.title) {
      return `Semestre ${semester.number} - ${semester.title}`
    }
    return `Semestre ${semester.number}`
  }

  function getTotalHoursForCourse(course: ProgramCourseRead): number {
    return course.lecture_hours + course.tutorial_hours + course.practical_hours
  }

  function calculateSemesterTotals(courses: ProgramCourseRead[]): {
    credits: number
    lecture: number
    tutorial: number
    practical: number
    total: number
  } {
    return courses.reduce((acc, course) => ({
      credits: acc.credits + (course.credits || 0),
      lecture: acc.lecture + course.lecture_hours,
      tutorial: acc.tutorial + course.tutorial_hours,
      practical: acc.practical + course.practical_hours,
      total: acc.total + course.lecture_hours + course.tutorial_hours + course.practical_hours,
    }), { credits: 0, lecture: 0, tutorial: 0, practical: 0, total: 0 })
  }

  return {
    // Semesters
    listSemesters,
    getSemesterById,
    createSemester,
    updateSemester,
    deleteSemester,

    // Courses
    getCoursesBySemester,
    createCourse,
    updateCourse,
    deleteCourse,

    // Helpers
    getSemesterDisplayName,
    getTotalHoursForCourse,
    calculateSemesterTotals,
  }
}
