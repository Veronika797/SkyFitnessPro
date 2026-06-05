import { useEffect, useState, useCallback } from "react";
import { getUserCourses } from "@/api/courseService";
import { Course } from "@/types";
import { useCourseActions } from "./useCourseActions";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/utils/errorUtils";
import { useCourseProgress } from "./useCourseProgress";

interface UserCourse extends Course {
  progress: number;
  status: "not_started" | "in_progress" | "completed";
}

export const useUserProfile = () => {
  const navigate = useNavigate();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { calculateProgress } = useCourseProgress();
  const actions = useCourseActions(userCourses, setUserCourses, navigate);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const courses = await getUserCourses();

      if (!courses || courses.length === 0) {
        setUserCourses([]);
        setLoading(false);
        return;
      }

      const coursesWithProgress = await Promise.all(
        courses.map(async (course) => {
          try {
            const { progress, status } = await calculateProgress(course);
            return { ...course, progress, status };
          } catch {
            return { ...course, progress: 0, status: "not_started" as const };
          }
        }),
      );

      setUserCourses(coursesWithProgress);
    } catch (err) {
      setError(getErrorMessage(err));
      setUserCourses([]);
    } finally {
      setLoading(false);
    }
  }, [calculateProgress]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  return {
    userCourses,
    loading,
    error,
    ...actions,
  };
};
