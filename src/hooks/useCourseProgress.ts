import { useCallback } from "react";
import { getCourseProgress } from "@/api/courseService";
import { Course, CourseProgress } from "@/types";

interface CourseProgressData {
  progress: number;
  status: "not_started" | "in_progress" | "completed";
}

const progressRequestCache = new Map<string, Promise<CourseProgress | null>>();
const progressResultCache = new Map<string, CourseProgressData>();

export const useCourseProgress = () => {
  const calculateProgress = useCallback(async (course: Course): Promise<CourseProgressData> => {
    try {
      if (!course) {
        return { progress: 0, status: "not_started" };
      }

      progressResultCache.delete(course._id);

      const cachedRequest = progressRequestCache.get(course._id);
      if (cachedRequest) {
        const progress = await cachedRequest;
        const result = calculateFromProgress(course, progress);
        return result;
      }

      const requestPromise = getCourseProgress(course._id)
        .then((data) => {
          progressRequestCache.delete(course._id);
          return data;
        })
        .catch(() => {
          progressRequestCache.delete(course._id);
          return null;
        });

      progressRequestCache.set(course._id, requestPromise);

      const progress = await requestPromise;
      const result = calculateFromProgress(course, progress);

      return result;
    } catch {
      return { progress: 0, status: "not_started" };
    }
  }, []);

  const calculateFromProgress = (
    course: Course,
    progress: CourseProgress | null,
  ): CourseProgressData => {
    if (!progress) {
      return { progress: 0, status: "not_started" };
    }

    const workouts = course.workouts || [];
    if (!Array.isArray(workouts) || workouts.length === 0) {
      return { progress: 0, status: "not_started" };
    }

    let completedWorkouts = 0;
    let startedWorkouts = 0;

    const workoutsProgress = progress.workoutsProgress || [];

    for (let i = 0; i < workouts.length; i++) {
      const workoutId = workouts[i];
      const workoutProgress = workoutsProgress.find((wp) => wp.workoutId === workoutId);

      if (!workoutProgress) {
        continue;
      }

      if (workoutProgress.workoutCompleted === true) {
        completedWorkouts++;
        continue;
      }

      const progressData = workoutProgress.progressData || [];

      const hasAnyProgress = progressData.some((value) => value > 0);

      if (hasAnyProgress) {
        startedWorkouts++;
      }
    }

    const totalWorkouts = workouts.length;
    const progressPercent = Math.round(
      ((completedWorkouts + startedWorkouts * 0.5) / totalWorkouts) * 100,
    );

    const status: "not_started" | "in_progress" | "completed" =
      progressPercent === 0 && startedWorkouts === 0
        ? "not_started"
        : progressPercent === 100
          ? "completed"
          : "in_progress";

    return { progress: progressPercent, status };
  };

  const clearCache = useCallback(() => {
    progressResultCache.clear();
    progressRequestCache.clear();
  }, []);

  return { calculateProgress, clearCache };
};

export const clearProgressCaches = () => {
  progressResultCache.clear();
  progressRequestCache.clear();
};
