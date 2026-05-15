// useCourses - course listing and enrollment management
import { useCallback, useState } from 'react';
import courseApi from '@/features/courses/api/courseApi';
import type { Course } from '@/features/courses/api/courseApi';

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async (params?: { category?: string; search?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await courseApi.getAllCourses();
      setCourses(data.data?.content ?? []);
      return data.data?.content ?? [];
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch courses';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCourse = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await courseApi.getCourseById(courseId);
      return result.data ?? null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch course';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const enrollCourse = useCallback(async (courseId: string) => {
    setLoading(true);
    setError(null);
    try {
      await courseApi.getCourseById(courseId);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to enroll';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    courses,
    loading,
    error,
    fetchCourses,
    getCourse,
    enrollCourse,
  };
}

export default useCourses;
