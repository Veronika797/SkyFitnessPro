import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getCourseById,
  getCourseProgress,
  saveWorkoutProgress,
  Course,
  CourseProgress,
  getWorkoutById,
} from "../../api/courseService";
import styles from "./WorkoutPage.module.css";

interface Exercise {
  _id: string;
  name: string;
  quantity: number;
}

interface Workout {
  _id: string;
  name: string;
  video: string; // YouTube URL
  exercises: Exercise[];
}

export const WorkoutPage: React.FC = () => {
  const { courseId, workoutId } = useParams<{
    courseId: string;
    workoutId: string;
  }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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
            const courseProgress: CourseProgress =
              await getCourseProgress(courseId);
            const workoutProgress = courseProgress.workoutsProgress?.find(
              (w) => w.workoutId === workoutId,
            );
            if (workoutProgress && workoutProgress.progressData) {
              setProgress(workoutProgress.progressData);
            }
          } catch (err) {
            console.error("Не удалось загрузить прогресс:", err);
          }
        }
      } catch (err: any) {
        console.error("Ошибка загрузки данных:", err);
        setError(
          err.response?.data?.message || "Не удалось загрузить тренировку",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, workoutId, user]);

  const handleProgressChange = (index: number, value: number) => {
    const newProgress = [...progress];
    newProgress[index] = Math.max(0, value);
    setProgress(newProgress);
  };

  const handleSaveProgress = async () => {
    if (!courseId || !workoutId) return;

    try {
      setSaving(true);
      await saveWorkoutProgress(courseId, workoutId, progress);
      alert("Прогресс сохранён!");
    } catch (err: any) {
      alert(
        "Ошибка при сохранении: " +
          (err.response?.data?.message || "Попробуйте снова"),
      );
    } finally {
      setSaving(false);
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

  if (!workout || !course) {
    return (
      <div className={styles.error}>
        <h2>Тренировка не найдена</h2>
        <button
          onClick={() => navigate("/profile")}
          className={styles.backButton}
        >
          ← Вернуться в профиль
        </button>
      </div>
    );
  }

  return (
    <div className={styles.workoutPage}>
      <div className={styles.header}>
        <button
          onClick={() => navigate("/profile")}
          className={styles.backButton}
        >
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
        <h2 className={styles.sectionTitle}>{workout.name}</h2>

        <div className={styles.exercisesGrid}>
          {workout.exercises.map((exercise, index) => (
            <div key={exercise._id} className={styles.exerciseCard}>
              <h3 className={styles.exerciseName}>{exercise.name}</h3>
              <div className={styles.exerciseInput}>
                <label>
                  Выполнено повторений:
                  <input
                    type="number"
                    min="0"
                    max={exercise.quantity}
                    value={progress[index] || 0}
                    onChange={(e) =>
                      handleProgressChange(index, parseInt(e.target.value) || 0)
                    }
                    className={styles.progressInput}
                  />
                </label>
                <span className={styles.exerciseTarget}>
                  / {exercise.quantity}
                </span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${exercise.quantity > 0 ? ((progress[index] || 0) / exercise.quantity) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          className={styles.saveButton}
          onClick={handleSaveProgress}
          disabled={saving}
        >
          {saving ? "Сохранение..." : "Заполнить свой прогресс"}
        </button>
      </div>
    </div>
  );
};
