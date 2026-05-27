import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getCourseById, addCourseToUser } from "../../utils/api";
import styles from "./CoursePage.module.css";
import { useAuth } from "../../context/AuthContext";

interface Course {
  _id: string;
  nameRU: string;
  nameEN: string;
  description: string;
  difficulty: string;
  durationInDays: number;
  dailyDurationInMinutes: {
    from: number;
    to: number;
  };
  fitting?: string[];
  directions?: string[];
}

export const CoursePage: React.FC = () => {
  const { _id } = useParams<{ _id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourseById(_id!);
        setCourse(data);
      } catch (err) {
        setError("Не удалось загрузить курс. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    if (_id) fetchCourse();
  }, [user, _id]);

  if (loading) return <div className={styles.loading}>Загрузка...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!course) return <div>Курс не найден</div>;

  const handleAddCourse = async () => {
    try {
      await addCourseToUser(_id!);
      setIsAdded(true);
      alert("Курс успешно добавлен!");
    } catch (err: any) {
      alert(err.message || "Не удалось добавить курс");
    }
  };

  const suitabilityItems = [
    "Давно хотели попробовать йогу, но не решались начать",
    "Хотите укрепить позвоночник, избавиться от болей в спине и суставах",
    "Ищете активность, полезную для тела и души",
  ];

  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{course.nameRU}</h1>
        <p className={styles.subtitle}>{course.nameEN}</p>
      </header>

      <div className={styles.imageWrapper}>
        <img
          src="/img/skillcard1.png"
          alt={course.nameRU}
          className={styles.courseImage}
        />
      </div>

      <section
        className={`${styles.description} ${styles.fadeIn}`}
        ref={sectionRef}
      >
        <h2>О курсе</h2>
        <p>{course.description}</p>
      </section>

      <section className={styles.suitability}>
        <h2>Подойдет для вас, если:</h2>
        <div className={styles.items}>
          {suitabilityItems.map((text, index) => (
            <div key={index} className={styles.item}>
              <div className={styles.number}>{index + 1}</div>
              <div className={styles.text}>{text}</div>
            </div>
          ))}
        </div>
      </section>

      {course.directions && course.directions.length > 0 && (
        <section className={styles.directions}>
          <h2>Направления</h2>
          <ul className={styles.directionList}>
            {course.directions.map((dir: string, i: number) => (
              <li key={i}>{dir}</li>
            ))}
          </ul>
        </section>
      )}

      <section className={styles.benefits}>
        <div className={styles.benefitsText}>
          <h2>Начните путь к новому телу</h2>
          <ul>
            <li>Проработка всех групп мышц</li>
            <li>Тренировка суставов</li>
            <li>Улучшение циркуляции крови</li>
            <li>Упражнения заряжают бодростью</li>
            <li>Помогают противостоять стрессам</li>
          </ul>
        </div>
        <div className={styles.benefitsImage}>
          <img src="/img/Run.png" alt="Начните путь к новому телу" />
        </div>
      </section>

      {user && (
        <div className={styles.ctaButton}>
          <button
            className={styles.startCourseBtn}
            onClick={handleAddCourse}
            disabled={isAdded}
          >
            {isAdded ? "Курс добавлен" : "Начать курс"}
          </button>
        </div>
      )}

      <section className={styles.details}>
        <div className={styles.detailItem}>
          <strong>Сложность:</strong> {course.difficulty}
        </div>
        <div className={styles.detailItem}>
          <strong>Длительность:</strong> {course.durationInDays} дней
        </div>
        <div className={styles.detailItem}>
          <strong>Ежедневная тренировка:</strong>{" "}
          {course.dailyDurationInMinutes.from}–
          {course.dailyDurationInMinutes.to} мин
        </div>
      </section>
    </div>
  );
};
