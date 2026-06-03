import { useEffect, useState, useCallback } from "react";
import { getUserCourses } from "@/api/courseService";
import { globalCache } from "@/api/globalCache";
import { Course } from "@/types";
import { useCourseActions } from "./useCourseActions";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "@/utils/errorUtils";

interface UserCourse extends Course {
  progress: number;
  status: "not_started" | "in_progress" | "completed";
}

export const useUserProfile = () => {
  const navigate = useNavigate();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actions = useCourseActions(userCourses, setUserCourses, navigate);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const cachedCourses = globalCache.get<UserCourse[]>("userCourses");
      if (cachedCourses) {
        setUserCourses(cachedCourses);
        setLoading(false);
        return;
      }

      const courses = await getUserCourses();

      if (!courses || courses.length === 0) {
        setUserCourses([]);
        setLoading(false);
        return;
      }

      const coursesWithDefaultProgress = courses.map((course) => ({
        ...course,
        progress: 0,
        status: "not_started" as const,
      }));

      setUserCourses(coursesWithDefaultProgress);

      globalCache.set("userCourses", coursesWithDefaultProgress);
    } catch (err) {
      console.error(" Ошибка загрузки курсов:", err);
      setError(getErrorMessage(err));
      setUserCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
