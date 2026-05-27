import axiosInstance from "./axiosInstance";

export interface WorkoutProgress {
  workoutId: string;
  workoutCompleted: boolean;
  progressData: number[];
}

export interface CourseProgress {
  courseId: string;
  courseCompleted: boolean;
  workoutsProgress: WorkoutProgress[];
}

export const getProgressByCourse = async (
  courseId: string,
): Promise<CourseProgress> => {
  const response = await axiosInstance.get<CourseProgress>(
    `/users/me/progress?courseId=${courseId}`,
  );
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

export const resetCourseProgress = async (
  courseId: string,
): Promise<{ message: string }> => {
  const response = await axiosInstance.patch<{ message: string }>(
    `/courses/${courseId}/reset`,
  );
  return response.data;
};
