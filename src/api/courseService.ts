import axiosInstance from "./axiosInstance";
import { Course, Workout, CourseProgress } from "@/types";
import { progressCache } from "./progressCache";

export const getAllCourses = async (): Promise<Course[]> => {
  const response = await axiosInstance.get<Course[]>("/courses");
  return response.data || [];
};

export const getCourseById = async (courseId: string): Promise<Course> => {
  const response = await axiosInstance.get<Course>(`/courses/${courseId}`);
  return response.data;
};

export const getCourseWorkouts = async (courseId: string): Promise<Workout[]> => {
  const response = await axiosInstance.get<Workout[]>(`/courses/${courseId}/workouts`);
  return response.data || [];
};

export const getWorkoutById = async (workoutId: string): Promise<Workout> => {
  if (!workoutId) {
    throw new Error(`getWorkoutById: missing workoutId="${workoutId}"`);
  }
  const response = await axiosInstance.get<Workout>(`/workouts/${workoutId}`);
  return response.data;
};

export const getUserCourseIds = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get<{ user: { selectedCourses?: string[] } }>("/users/me");

    const courseIds = response.data?.user?.selectedCourses || [];

    return Array.isArray(courseIds) ? courseIds : [];
  } catch {
    return [];
  }
};

export const getUserCourses = async (): Promise<Course[]> => {
  const courseIds = await getUserCourseIds();
  if (!courseIds || courseIds.length === 0) {
    return [];
  }

  const promises = courseIds.map((id) => getCourseById(id).catch(() => null));

  const courses = await Promise.all(promises);
  return courses.filter((c): c is Course => c !== null);
};

export const addCourseToUser = async (courseId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>(
    "/users/me/courses",
    JSON.stringify({ courseId }),
  );
  progressCache.clear();
  return response.data;
};

export const removeUserCourse = async (courseId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/users/me/courses/${courseId}`);
  progressCache.clear();
  return response.data;
};

export const getCourseProgress = async (courseId: string): Promise<CourseProgress | null> => {
  const cached = progressCache.get(courseId);
  if (cached) {
    return cached;
  }
  try {
    const response = await axiosInstance.get<CourseProgress>(`/users/me/progress`, {
      params: { courseId },
    });
    progressCache.set(courseId, response.data);
    return response.data;
  } catch (_error) {
    return null;
  }
};

export const saveWorkoutProgress = async (
  courseId: string,
  workoutId: string,
  progressData: number[],
): Promise<{ message: string }> => {
  const workout = await getWorkoutById(workoutId);
  const exerciseCount = workout.exercises?.length || 0;

  if (progressData.length !== workout.exercises.length) {
    throw new Error(
      `Количество значений прогресса (${progressData.length}) не совпадает с количеством упражнений (${exerciseCount})`,
    );
  }

  const response = await axiosInstance.patch<{ message: string }>(
    `/courses/${courseId}/workouts/${workoutId}`,
    JSON.stringify({ progressData }),
  );
  progressCache.clear();
  return response.data;
};

export const resetCourseProgress = async (courseId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.patch<{ message: string }>(`/courses/${courseId}/reset`);
  progressCache.clear();
  return response.data;
};

export const resetWorkoutProgress = async (
  courseId: string,
  workoutId: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.patch<{ message: string }>(
    `/courses/${courseId}/workouts/${workoutId}/reset`,
  );
  progressCache.clear();
  return response.data;
};
