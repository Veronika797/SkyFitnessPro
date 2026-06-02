import { useEffect, useState } from "react";
import { getUserCourses } from "@/api/courseService";
import { Course } from "@/types";
import { useCourseActions } from "./useCourseActions";
import { useCourseProgress } from "./useCourseProgress";
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

  const { calculateProgress } = useCourseProgress();
  const actions = useCourseActions(userCourses, setUserCourses, navigate);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        const courses = await getUserCourses();
        const enrichedCourses = await Promise.all(
          courses.map(async (course) => {
            const { progress, status } = await calculateProgress(course._id);
            return { ...course, progress, status };
          }),
        );
        setUserCourses(enrichedCourses);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  return {
    userCourses,
    loading,
    error,
    ...actions,
  };
};
