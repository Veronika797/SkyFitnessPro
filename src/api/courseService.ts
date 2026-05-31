import axiosInstance from "./axiosInstance";
import { Course, Workout, CourseProgress } from "@/types";

export const getAllCourses = async (): Promise<Course[]> => {
  const response = await axiosInstance.get<Course[]>("/courses");
  return response.data;
};

export const getCourseById = async (courseId: string): Promise<Course> => {
  const response = await axiosInstance.get<Course>(`/courses/${courseId}`);
  return response.data;
};

export const getCourseWorkouts = async (courseId: string): Promise<Workout[]> => {
  const response = await axiosInstance.get<Workout[]>(`/courses/${courseId}/workouts`);
  return response.data;
};

export const getWorkoutById = async (courseId: string, workoutId: string): Promise<Workout> => {
  if (!courseId || !workoutId) {
    throw new Error(`getWorkoutById: missing courseId="${courseId}" or workoutId="${workoutId}"`);
  }

  const response = await axiosInstance.get<Workout>(`/courses/${courseId}/workouts/${workoutId}`);
  return response.data;
};

export const getUserCourseIds = async (): Promise<string[]> => {
  const response = await axiosInstance.get<{ selectedCourses: string[] }>("/users/me");
  return response.data.selectedCourses;
};

export const getUserCourses = async (): Promise<Course[]> => {
  const courseIds = await getUserCourseIds();
  if (courseIds.length === 0) return [];
  const promises = courseIds.map((id) => getCourseById(id));
  return Promise.all(promises);
};

export const getProgressByCourse = async (courseId: string): Promise<CourseProgress> => {
  const response = await axiosInstance.get<CourseProgress>(
    `/progress/users/me/progress?courseId=${courseId}`,
  );
  return response.data;
};

export const addCourseToUser = async (courseId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.post<{ message: string }>("/users/me/courses", { courseId });
  return response.data;
};

export const removeUserCourse = async (courseId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.delete<{ message: string }>(`/users/me/courses/${courseId}`);
  return response.data;
};

export const getCourseProgress = async (courseId: string): Promise<CourseProgress> => {
  const response = await axiosInstance.get<CourseProgress>("/users/me/progress", {
    params: { courseId },
  });
  return response.data;
};

export const saveWorkoutProgress = async (
  courseId: string,
  workoutId: string,
  progressData: number[],
): Promise<{ message: string }> => {
  const response = await axiosInstance.patch<{ message: string }>(
    `/courses/${courseId}/workouts/${workoutId}`,
    { progressData },
  );
  return response.data;
};

export const resetCourseProgress = async (courseId: string): Promise<{ message: string }> => {
  const response = await axiosInstance.patch<{ message: string }>(`/courses/${courseId}/reset`);
  return response.data;
};

export const resetWorkoutProgress = async (
  courseId: string,
  workoutId: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.patch<{ message: string }>(
    `/courses/${courseId}/workouts/${workoutId}/reset`,
  );
  return response.data;
};
