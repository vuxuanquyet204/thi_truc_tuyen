// Admin Course API Service - Re-export from main API
import courseApiMain, {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseMaterials,
  addMaterialToCourse,
  updateMaterial,
  deleteMaterial,
  getQuizDetails,
  submitQuiz,
  getCourseProgressDashboard,
  grantReward,
  getStudentRewards,
  type Course,
  type CreateCourseRequest,
  type UpdateCourseRequest,
  type Material,
  type CreateMaterialRequest,
  type UpdateMaterialRequest,
  type Reward,
  type GrantRewardRequest,
  type Quiz,
  type QuizResult,
  type SubmitQuizRequest,
  type Progress,
  type PageResponse,
  type ApiResponse,
} from '@/features/courses/api';

// Re-export functions for admin use
export {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseMaterials,
  addMaterialToCourse,
  updateMaterial,
  deleteMaterial,
  getQuizDetails,
  submitQuiz,
  getCourseProgressDashboard,
  grantReward,
  getStudentRewards,
};

// Re-export types for admin use
export type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
  Material,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  Reward,
  GrantRewardRequest,
  Quiz,
  QuizResult,
  SubmitQuizRequest,
  Progress,
  PageResponse,
  ApiResponse,
};

// Admin-specific functions (if needed in future)
// These are placeholders for potential admin-only operations

/**
 * Get course statistics (admin only)
 */
export async function getCourseStatistics(): Promise<{
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  averageRating: number;
}> {
  try {
    // TODO: Implement when backend has admin stats endpoint
    // const response = await axios.get(`${API_BASE_URL}/admin/courses/stats`)
    // return response.data
    
    // Placeholder: Calculate from getAllCourses
    const coursesResponse = await getAllCourses(0, 1000);
    if (!coursesResponse.data) {
      throw new Error('No data received from getAllCourses');
    }
    const courses = coursesResponse.data.content;
    
    return {
      totalCourses: courses.length,
      publishedCourses: courses.filter(c => c.isPublished).length,
      draftCourses: courses.filter(c => !c.isPublished).length,
      totalEnrollments: courses.reduce((sum, c) => sum + (c.enrollmentCount || 0), 0),
      averageRating: courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length || 0,
    };
  } catch (error) {
    console.error('Error getting course statistics:', error);
    throw new Error('Failed to get course statistics');
  }
}

/**
 * Get top performing courses (admin only)
 */
export async function getTopCourses(limit: number = 10): Promise<Course[]> {
  try {
    const coursesResponse = await getAllCourses(0, 100);
    if (!coursesResponse.data) {
      throw new Error('No data received from getAllCourses');
    }
    const courses = coursesResponse.data.content;
    
    return courses
      .filter(c => c.isPublished)
      .sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top courses:', error);
    throw new Error('Failed to get top courses');
  }
}

/**
 * Search courses by query (admin only)
 */
export async function searchCourses(query: string, page = 0, size = 10): Promise<ApiResponse<PageResponse<Course>>> {
  try {
    // TODO: Implement when backend has search endpoint
    // For now, use getAllCourses and filter on frontend
    const coursesResponse = await getAllCourses(page, size);
    
    if (!query) {
      return coursesResponse;
    }
    
    if (!coursesResponse.data) {
      throw new Error('No data received from getAllCourses');
    }
    
    const filtered = coursesResponse.data.content.filter(course =>
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.description.toLowerCase().includes(query.toLowerCase())
    );
    
    const totalPages = Math.ceil(filtered.length / size);
    
    return {
      ...coursesResponse,
      data: {
        content: filtered,
        totalElements: filtered.length,
        totalPages,
        pageable: coursesResponse.data.pageable ?? {
          pageNumber: page,
          pageSize: size,
          sort: { sorted: false, unsorted: true, empty: true },
          offset: page * size,
          paged: true,
          unpaged: false,
        },
        last: page >= totalPages - 1,
        size,
        number: page,
        sort: coursesResponse.data.sort ?? { sorted: false, unsorted: true, empty: true },
        numberOfElements: filtered.length,
        first: page === 0,
        empty: filtered.length === 0,
      }
    };
  } catch (error) {
    console.error('Error searching courses:', error);
    throw new Error('Failed to search courses');
  }
}

// Admin Course API object
export const adminCourseApi = {
  // Course operations
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  
  // Material operations
  getCourseMaterials,
  addMaterialToCourse,
  updateMaterial,
  deleteMaterial,

  // Reward operations
  grantReward,
  getStudentRewards,
  
  // Quiz operations
  getQuizDetails,
  submitQuiz,
  
  // Progress operations
  getCourseProgressDashboard,
  
  // Admin-specific operations
  getCourseStatistics,
  getTopCourses,
  searchCourses,
};

export default adminCourseApi;
