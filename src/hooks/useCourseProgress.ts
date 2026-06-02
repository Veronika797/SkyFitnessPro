import { useCallback } from "react";
import { getCourseProgress } from "@/api/courseService";
import { Course } from "@/types";

interface CourseProgressData {
  progress: number;
  status: "not_started" | "in_progress" | "completed";
}

export const useCourseProgress = () => {
  const calculateProgress = useCallback(async (course: Course): Promise<CourseProgressData> => {
    try {
      if (!course) {
        return { progress: 0, status: "not_started" };
      }

      const progress = await getCourseProgress(course._id);

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
    } catch {
      return { progress: 0, status: "not_started" };
    }
  }, []);

  return { calculateProgress };
};
