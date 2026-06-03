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

      const cachedResult = progressResultCache.get(course._id);
      if (cachedResult) {
        return cachedResult;
      }

      const cachedRequest = progressRequestCache.get(course._id);
      if (cachedRequest) {
        const progress = await cachedRequest;
        const result = calculateFromProgress(course, progress);
        progressResultCache.set(course._id, result);
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

      progressResultCache.set(course._id, result);

      return result;
    } catch {
      return { progress: 0, status: "not_started" };
    }
  }, []);

  const clearCache = useCallback(() => {
    progressResultCache.clear();
    progressRequestCache.clear();
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

    const completedWorkouts =
      progress.workoutsProgress?.filter((wp) => wp.workoutCompleted === true).length || 0;

    const percent = Math.round((completedWorkouts / workouts.length) * 100);

    const status: "not_started" | "in_progress" | "completed" =
      percent === 0 ? "not_started" : percent === 100 ? "completed" : "in_progress";

    return { progress: percent, status };
  };

  return { calculateProgress, clearCache };
};
