import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getCourseById,
  addCourseToUser,
  Course,
} from "../../api/courseService";
import styles from "./CourseDescription.module.css";

const COURSE_IMAGES: Record<string, string> = {
  Йога: "/img/skillcard1.png",
  Стретчинг: "/img/skillcard2.png",
  Фитнес: "/img/skillcard3.png",
  "Степ-аэробика": "/img/skillcard4.png",
  Бодифлекс: "/img/skillcard5.png",
};

export const CourseDescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, openLoginModal, setReturnUrl } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getCourseById(id);
        setCourse(data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Не удалось загрузить курс");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  const handleActionClick = async () => {
    if (user) {
      try {
        setAdding(true);
        await addCourseToUser(id!);
        alert("Курс добавлен в ваш профиль!");
      } catch (err: any) {
        alert(
          "Ошибка: " +
            (err.response?.data?.message || "Не удалось добавить курс"),
        );
      } finally {
        setAdding(false);
      }
    } else {
      setReturnUrl(window.location.pathname);
      openLoginModal();
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

  const courseImage = COURSE_IMAGES[course.nameRU] || "/img/placeholder.svg";

  const benefits = [
    "проработка всех групп мышц",
    "тренировка суставов",
    "улучшение циркуляции крови",
    "упражнения заряжают бодростью",
    "помогают противостоять стрессам",
  ];

  return (
    <div className={styles.coursePage}>
      <div className={styles.header}>
        <div
          className={styles.headerBackground}
          style={{
            backgroundImage: `url(${courseImage})`,
          }}
        />
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
              className={styles.newBodyButton}
              onClick={handleActionClick}
              disabled={adding}
            >
              {adding
                ? "Добавление..."
                : user
                  ? "Добавить курс"
                  : "Войдите, чтобы добавить курс"}
            </button>
          </div>
        </div>
        <div className={styles.newBodyImage}>
          <img src="/img/Run.png" alt="Начните путь к новому телу" />
        </div>
      </section>
    </div>
  );
};
