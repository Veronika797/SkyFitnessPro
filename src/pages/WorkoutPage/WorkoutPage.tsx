import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  getCourseById,
  getWorkoutById,
  getCourseProgress,
  saveWorkoutProgress,
} from "@/api/courseService";
import { Course, Workout } from "@/types";
import { ProgressModal } from "@/components/modals/ProgressModal/ProgressModal";
import styles from "./WorkoutPage.module.css";
import { toast } from "react-toastify";
import { SuccessModal } from "@/components/modals/SuccessModal/SuccessModal";
import { getErrorMessage } from "@/utils/errorUtils";

export const WorkoutPage: React.FC = () => {
  const { courseId, workoutId } = useParams<{
    courseId: string;
    workoutId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [progress, setProgress] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !workoutId) {
        setError("Не указан курс или тренировка");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const courseData = await getCourseById(courseId);
        setCourse(courseData);

        const workoutData = await getWorkoutById(workoutId);
        setWorkout(workoutData);

        setProgress(new Array(workoutData.exercises.length).fill(0));

        if (user) {
          try {
            const courseProgress = await getCourseProgress(courseId);

            if (courseProgress) {
              const workoutProgress = courseProgress.workoutsProgress?.find(
                (w) => w.workoutId === workoutId,
              );

              if (
                workoutProgress?.progressData &&
                workoutProgress.progressData.length === workoutData.exercises.length
              ) {
                setProgress(workoutProgress.progressData);
              }
            }
          } catch (err) {
            toast.error("Не удалось загрузить прогресс: " + getErrorMessage(err));
          }
        }
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, workoutId, user]);

  const handleSaveProgress = async (userProgress: Record<string, number>) => {
    if (!courseId || !workoutId || !workout) return;

    try {
      setSaving(true);

      const newProgress = workout.exercises.map((ex) => {
        return userProgress[ex._id] || 0;
      });
      setProgress(newProgress);

      await saveWorkoutProgress(courseId, workoutId, newProgress);
      setIsSuccessModalOpen(true);
    } catch (err) {
      toast.error("Ошибка при сохранении: " + getErrorMessage(err));
    } finally {
      setSaving(false);
      setIsProgressModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Загрузка тренировки...</p>
      </div>
    );
  }

  if (error || !workout || !course) {
    return (
      <div className={styles.error}>
        <h2>{error || "Тренировка не найдена"}</h2>
        <button onClick={() => navigate("/profile")} className={styles.backButton}>
          ← Вернуться в профиль
        </button>
      </div>
    );
  }

  return (
    <div className={styles.workoutPage}>
      <div className={styles.header}>
        <button onClick={() => navigate("/profile")} className={styles.backButton}>
          ← Назад к курсам
        </button>
        <h1 className={styles.courseTitle}>{course.nameRU}</h1>
      </div>

      <div className={styles.videoSection}>
        <div className={styles.videoWrapper}>
          <iframe
            src={workout.video}
            title={workout.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={styles.videoFrame}
          />
        </div>
      </div>
      <div className={styles.exercisesSection}>
        <h2 className={styles.sectionTitle}>{workout.name || "Упражнения тренировки"}</h2>

        <div className={styles.exercisesGrid}>
          {workout.exercises.map((exercise, index) => {
            const currentProgress = progress[index] || 0;
            const progressPercent =
              exercise.quantity > 0
                ? Math.min((currentProgress / exercise.quantity) * 100, 100)
                : 0;

            return (
              <div key={exercise._id} className={styles.exerciseCard}>
                <h3
                  className={styles.exerciseName}
                  data-percent={`${Math.round(progressPercent)}%`}
                >
                  {exercise.name}
                </h3>

                <div className={styles.miniProgressBar}>
                  <div
                    className={styles.miniProgressFill}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <button
          className={styles.saveButton}
          onClick={() => setIsProgressModalOpen(true)}
          disabled={saving}
        >
          {saving ? "Сохранение..." : "Обновить свой прогресс"}
        </button>
      </div>

      {isProgressModalOpen && workout && (
        <ProgressModal
          exercises={workout.exercises}
          courseName={course!.nameRU}
          onClose={() => setIsProgressModalOpen(false)}
          onSave={handleSaveProgress}
        />
      )}

      {isSuccessModalOpen && <SuccessModal onClose={() => setIsSuccessModalOpen(false)} />}
    </div>
  );
};
