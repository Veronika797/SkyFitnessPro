import { useState } from "react";
import { removeUserCourse, getCourseWorkouts, resetCourseProgress } from "@/api/courseService";
import { Course, Exercise, Workout } from "@/types";
import { useCourseProgress } from "./useCourseProgress";
import { useModalManagement } from "./useModalManagement";
import { toast } from "react-toastify";
import { confirmWithToast } from "@/utils/confirmToast/confirmToast";
import { useAuth } from "@/context/AuthContext";

interface UseCourseActionsReturn {
  selectedCourseId: string | null;
  courseWorkouts: Workout[];
  workoutsLoading: boolean;
  currentCourseExercises: Exercise[];

  handleStartCourse: (courseId: string) => Promise<void>;
  handleRemoveCourse: (courseId: string) => void;
  handleRestartCourse: (courseId: string) => void;
  handleWorkoutSelect: (workoutId: string) => void;

  isWorkoutModalOpen: boolean;
  openWorkoutModal: () => void;
  closeWorkoutModal: () => void;
}

export const useCourseActions = <T extends Course>(
  _userCourses: T[],
  setUserCourses: React.Dispatch<React.SetStateAction<T[]>>,
  navigate: (path: string) => void,
): UseCourseActionsReturn => {
  const { calculateProgress } = useCourseProgress();
  const { isWorkoutModalOpen, openWorkoutModal, closeWorkoutModal } = useModalManagement();
  const { removeCourseLocally } = useAuth();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [courseWorkouts, setCourseWorkouts] = useState<Workout[]>([]);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const [currentCourseExercises, setCurrentCourseExercises] = useState<Exercise[]>([]);

  const handleStartCourse = async (courseId: string) => {
    try {
      setWorkoutsLoading(true);

      const workouts = await getCourseWorkouts(courseId);

      if (workouts && workouts.length > 0) {
        setSelectedCourseId(courseId);
        setCourseWorkouts(workouts);
        openWorkoutModal();

        const allExercises: Exercise[] = workouts.flatMap((w) => w.exercises || []);
        setCurrentCourseExercises(allExercises);
      } else {
        toast.info("Тренировки для этого курса пока не доступны");
      }
    } catch (err) {
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
        if (axiosError.response?.status === 500) {
          toast.error("Сервер временно недоступен. Попробуйте позже.");
        } else if (axiosError.response?.status === 404) {
          toast.error("Тренировки не найдены");
        } else {
          toast.error("Не удалось загрузить тренировки");
        }
      } else {
        toast.error("Не удалось загрузить тренировки. Проверьте интернет-соединение.");
      }
    } finally {
      setWorkoutsLoading(false);
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    const ok = await confirmWithToast({
      title: "Удалить курс?",
      description: "Курс будет удалён из вашего профиля.",
      confirmText: "Удалить",
      cancelText: "Отмена",
    });

    if (!ok) {
      return;
    }

    try {
      await removeUserCourse(courseId);
      setUserCourses((prev) => prev.filter((c) => c._id !== courseId));
      removeCourseLocally(courseId);
      toast.success("Курс удалён из профиля");
    } catch (_err) {
      toast.error("Не удалось удалить курс");
    }
  };

  const handleRestartCourse = async (courseId: string) => {
    if (!window.confirm("Вы уверены, что хотите начать курс заново?")) return;
    try {
      await resetCourseProgress(courseId);

      const course = _userCourses.find((c) => c._id === courseId);
      if (!course) {
        toast.error("Курс не найден");
        return;
      }

      const { progress, status } = await calculateProgress(course);

      setUserCourses((prev) =>
        prev.map((course) =>
          course._id === courseId ? ({ ...course, progress, status } as T) : course,
        ),
      );
      toast.success("Прогресс курса сброшен. Можно начинать заново!");
    } catch (_err) {
      toast.error("Не удалось сбросить прогресс");
    }
  };

  const handleWorkoutSelect = (workoutId: string) => {
    closeWorkoutModal();
    navigate(`/courses/${selectedCourseId}/workout/${workoutId}`);
  };

  return {
    selectedCourseId,
    courseWorkouts,
    workoutsLoading,
    currentCourseExercises,

    handleStartCourse,
    handleRemoveCourse,
    handleRestartCourse,
    handleWorkoutSelect,

    isWorkoutModalOpen,
    openWorkoutModal,
    closeWorkoutModal,
  };
};
