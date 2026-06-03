import axiosInstance from "./axiosInstance";
import { Course, Workout, CourseProgress } from "@/types";
import { progressCache } from "./progressCache";
import { globalCache } from "./globalCache";

export const getAllCourses = async (): Promise<Course[]> => {
  const cached = globalCache.get<Course[]>("allCourses");
  if (cached) return cached;

  const response = await axiosInstance.get<Course[]>("/courses");
  const data = response.data || [];

  globalCache.set("allCourses", data);

  return data;
};

export const getCourseById = async (courseId: string): Promise<Course> => {
  const cached = globalCache.get<Course>(`course_${courseId}`);
  if (cached) return cached;

  const response = await axiosInstance.get<Course>(`/courses/${courseId}`);
  globalCache.set(`course_${courseId}`, response.data);
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
  const cached = globalCache.get<string[]>("userCourseIds");
  if (cached) {
    return cached;
  }

  try {
    const response = await axiosInstance.get<{ user: { selectedCourses?: string[] } }>("/users/me");
    const courseIds = response.data?.user?.selectedCourses || [];
    const result = Array.isArray(courseIds) ? courseIds : [];

    globalCache.set("userCourseIds", result);

    return result;
  } catch {
    return [];
  }
};

export const getUserCourses = async (): Promise<Course[]> => {
  const cached = globalCache.get<Course[]>("userCoursesList");
  if (cached) {
    return cached;
  }

  const courseIds = await getUserCourseIds();
  if (!courseIds || courseIds.length === 0) {
    return [];
  }

  const allCourses = await getAllCourses();

  const idSet = new Set(courseIds);
  const userCourses = allCourses.filter((course) => idSet.has(course._id));

  globalCache.set("userCoursesList", userCourses);

  return userCourses;
};

export const addCourseToUser = async (courseId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>(
    "/users/me/courses",
    JSON.stringify({ courseId }),
  );

  globalCache.clearKey("userCourses");
  globalCache.clearKey("userCoursesList");
  globalCache.clearKey("userCourseIds");
  progressCache.clear();

  return response.data;
};

export const removeUserCourse = async (courseId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/users/me/courses/${courseId}`);

  globalCache.clearKey("userCourses");
  globalCache.clearKey("userCoursesList");
  globalCache.clearKey("userCourseIds");
  progressCache.clearCourse(courseId);

  return response.data;
};

export const getCourseProgress = async (courseId: string): Promise<CourseProgress | null> => {
  const cached = progressCache.get(courseId);
  if (cached) return cached;

  try {
    const response = await axiosInstance.get<CourseProgress>(`/users/me/progress`, {
      params: { courseId },
    });
    progressCache.set(courseId, response.data);
    return response.data;
  } catch {
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

  if (progressData.length !== exerciseCount) {
    throw new Error(
      `Количество значений прогресса (${progressData.length}) не совпадает с количеством упражнений (${exerciseCount})`,
    );
  }

  const response = await axiosInstance.patch<{ message: string }>(
    `/courses/${courseId}/workouts/${workoutId}`,
    JSON.stringify({ progressData }),
  );
  progressCache.clearCourse(courseId);
  return response.data;
};

export const resetCourseProgress = async (courseId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.patch<{ message: string }>(`/courses/${courseId}/reset`);
  progressCache.clearCourse(courseId);
  return response.data;
};

export const resetWorkoutProgress = async (
  courseId: string,
  workoutId: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.patch<{ message: string }>(
    `/courses/${courseId}/workouts/${workoutId}/reset`,
  );
  progressCache.clearCourse(courseId);
  return response.data;
};
