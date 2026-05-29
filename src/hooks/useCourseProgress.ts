import { useCallback } from "react";
import { getCourseById, getWorkoutById, getCourseProgress } from "@/api/courseService";
import { Workout, Exercise } from "@/types";

interface CourseProgressData {
  progress: number;
  status: "not_started" | "in_progress" | "completed";
}

export const useCourseProgress = () => {
  const calculateProgress = useCallback(async (courseId: string): Promise<CourseProgressData> => {
    try {
      const course = await getCourseById(courseId);
      const progress = await getCourseProgress(courseId);

      if (!progress || !Array.isArray(course.workouts) || course.workouts.length === 0) {
        return { progress: 0, status: "not_started" };
      }

      let totalReps = 0;
      let completedReps = 0;

      const workoutPromises = course.workouts.map((workoutId) =>
        getWorkoutById(workoutId).catch(() => null),
      );
      const workouts = (await Promise.all(workoutPromises)).filter((w): w is Workout => w !== null);

      for (const workout of workouts) {
        if (!workout) continue;

        const exercisesArray: Exercise[] = Array.isArray(workout.exercises)
          ? workout.exercises
          : [];

        const workoutProgress = progress.workoutsProgress?.find(
          (wp) => wp.workoutId === workout._id,
        );

        for (const exercise of exercisesArray) {
          const quantity = Number(exercise.quantity);
          if (isNaN(quantity) || quantity <= 0) continue;

          totalReps += quantity;

          const exIndex = exercisesArray.findIndex((ex: Exercise) => ex._id === exercise._id);
          if (exIndex !== -1 && Array.isArray(workoutProgress?.progressData)) {
            const progressValue = workoutProgress.progressData[exIndex];
            if (typeof progressValue === "number" && !isNaN(progressValue)) {
              completedReps += progressValue;
            }
          }
        }
      }

      const percent = totalReps === 0 ? 0 : Math.round((completedReps / totalReps) * 100);
      const status: "not_started" | "in_progress" | "completed" =
        percent === 0 ? "not_started" : percent === 100 ? "completed" : "in_progress";

      return { progress: percent, status };
    } catch (_err) {
      return { progress: 0, status: "not_started" };
    }
  }, []);

  return { calculateProgress };
};
