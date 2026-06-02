import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  getCourseById,
  addCourseToUser,
  getCourseProgress,
  removeUserCourse,
} from "@/api/courseService";
import { Course, CourseProgress } from "@/types";
import styles from "./CourseDescription.module.css";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/errorUtils";

const BG_CLASSES: Record<string, string> = {
  Йога: styles.bgYoga,
  Стретчинг: styles.bgStretching,
  Фитнес: styles.bgFitness,
  "Степ-аэробика": styles.bgStep,
  Бодифлекс: styles.bgBodyflex,
};

export const CourseDescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, openLoginModal, setReturnUrl, addCourseLocally, removeCourseLocally } = useAuth();
  const [_progress, setProgress] = useState<CourseProgress | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const isAdded = user?.selectedCourses?.includes(id || "") || false;

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getCourseById(id);
        setCourse(data);

        if (user && isAdded) {
          try {
            const prog = await getCourseProgress(id);
            setProgress(prog || { courseId: id, courseCompleted: false, workoutsProgress: [] });
          } catch {
            setProgress({ courseId: id, courseCompleted: false, workoutsProgress: [] });
          }
        } else {
          setProgress({ courseId: id, courseCompleted: false, workoutsProgress: [] });
        }
      } catch (err) {
        setError(getErrorMessage(err));
        setProgress({ courseId: id, courseCompleted: false, workoutsProgress: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id, user]);

  const handleActionClick = async () => {
    if (!user) {
      setReturnUrl(window.location.pathname);
      openLoginModal();
      return;
    }

    if (!id) return;

    try {
      setProcessing(true);

      if (isAdded) {
        await removeUserCourse(id);
        removeCourseLocally(id);
        toast.info("Курс удалён из вашего профиля");
      } else {
        await addCourseToUser(id);
        addCourseLocally(id);
        toast.success("Курс добавлен в ваш профиль!");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Загрузка курса...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className={styles.error}>
        <h2>{error || "Курс не найден"}</h2>
        <button onClick={() => navigate("/")} className={styles.backButton}>
          ← На главную
        </button>
      </div>
    );
  }

  const bgClass = BG_CLASSES[course.nameRU] || "";

  const benefits = [
    "проработка всех групп мышц",
    "тренировка суставов",
    "улучшение циркуляции крови",
    "упражнения заряжают бодростью",
    "помогают противостоять стрессам",
  ];

  const getButtonText = () => {
    if (processing) return "Обработка...";
    if (!user) return "Войдите, чтобы добавить курс";
    if (isAdded) return "Курс добавлен ✓";
    return "Добавить курс";
  };

  return (
    <div className={styles.coursePage}>
      <div className={styles.header}>
        <div className={`${styles.headerBackground} ${bgClass}`} />
      </div>

      {course.fitting?.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Подойдет для вас, если:</h2>
          <div className={styles.reasonsGrid}>
            {course.fitting.map((reason, index) => (
              <div key={index} className={styles.reasonCard}>
                <span className={styles.reasonNumber}>{index + 1}</span>
                <p className={styles.reasonText}>{reason}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {course.directions?.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Направления</h2>
          <div className={styles.directionsContainer}>
            {course.directions.map((direction, index) => (
              <div key={index} className={styles.directionItem}>
                <span className={styles.directionPlus}>
                  <img src="/img/star.svg" />
                </span>
                <span>{direction}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={styles.newBodySection}>
        <div className={styles.sectionClip}>
          <img src="/img/line.svg" alt="Стрелка" className={styles.arrowOverlay} />
        </div>
        <div className={styles.newBodyContent}>
          <div className={styles.newBodyText}>
            <h2 className={styles.newBodyTitle}>
              Начните путь
              <br />к новому телу
            </h2>
            <ul className={styles.benefitsList}>
              {benefits.map((benefit, index) => (
                <li key={index} className={styles.benefitItem}>
                  {benefit}
                </li>
              ))}
            </ul>
            <button
              className={`${styles.newBodyButton} ${isAdded ? styles.added : ""}`}
              onClick={handleActionClick}
              disabled={processing}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
        <div className={styles.newBodyImageWrapper}>
          <img src="/img/Run.png" alt="Начните путь к новому телу" className={styles.runnerImage} />
          <svg
            className={styles.shoulderAccent}
            viewBox="0 0 120 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 30 Q 60 0, 110 25"
              stroke="rgba(0, 0, 0, 1)"
              strokeWidth="12"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </section>
    </div>
  );
};
