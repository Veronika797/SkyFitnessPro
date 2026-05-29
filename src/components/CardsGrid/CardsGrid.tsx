import React, { useEffect, useState } from "react";
import styles from "./CardsGrid.module.css";
import { useNavigate } from "react-router-dom";
import { getAllCourses, addCourseToUser, removeUserCourse } from "@/api/courseService";
import { Course } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { getErrorMessage } from "@/utils/errorUtils";

const COURSE_COLORS: Record<string, string> = {
  Йога: styles.bgYoga,
  Стретчинг: styles.bgStretching,
  Фитнес: styles.bgFitness,
  "Степ-аэробика": styles.bgStep,
  Бодифлекс: styles.bgBodyflex,
};

const COURSE_IMAGES: Record<string, string> = {
  Йога: "/img/Maskgroup.png",
  Стретчинг: "/img/Maskgroup1.png",
  Фитнес: "/img/Maskgroup2.png",
  "Степ-аэробика": "/img/Maskgroup3.png",
  Бодифлекс: "/img/Maskgroup4.png",
};

export const CardsGrid: React.FC = () => {
  const navigate = useNavigate();
  const { user, addCourseLocally, removeCourseLocally } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [addedCourses, setAddedCourses] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        setCourses(data);

        if (user) {
          const userCourseIds = await Promise.resolve(user.selectedCourses);
          setAddedCourses(new Set(userCourseIds));
        }
      } catch (_err) {
        setError("Не удалось загрузить курсы");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [user]);

  useEffect(() => {
    if (user) {
      setAddedCourses(new Set(user.selectedCourses));
    }
  }, [user]);

  const handleAddClick = async (e: React.MouseEvent<HTMLButtonElement>, courseId: string) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login", { state: { from: { pathname: "/" } } });
      return;
    }

    try {
      if (addedCourses.has(courseId)) {
        await removeUserCourse(courseId);
        removeCourseLocally(courseId);
        setAddedCourses((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
        toast.info("Курс удалён");
      } else {
        await addCourseToUser(courseId);
        addCourseLocally(courseId);
        setAddedCourses((prev) => new Set([...prev, courseId]));
        toast.success("Курс добавлен!");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleCardClick = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Загрузка курсов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className={styles.retryBtn}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className={styles.cardsGrid}>
      {courses.map((course) => {
        const bgColor = COURSE_COLORS[course.nameRU] || "";
        const imageSrc = COURSE_IMAGES[course.nameRU] || "/img/placeholder.png";
        const isAdded = addedCourses.has(course._id);

        return (
          <div
            key={course._id}
            className={styles.cardWrapper}
            onClick={() => handleCardClick(course._id)}
          >
            <div className={styles.card}>
              <div className={`${styles.cardImage} ${bgColor}`}>
                <button
                  className={`${styles.cardAddBtn} ${isAdded ? styles.added : ""}`}
                  aria-label={isAdded ? "Удалить курс" : "Добавить курс"}
                  onClick={(e) => handleAddClick(e, course._id)}
                >
                  {isAdded ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="white" />
                    </svg>
                  ) : (
                    "+"
                  )}
                  <span className={styles.tooltip}>
                    {isAdded ? "Удалить курс" : "Добавить курс"}
                  </span>
                </button>

                <img src={imageSrc} alt={course.nameRU} />
              </div>

              <div className={styles.cardContent}>
                <h3 className={styles.cardTitle}>{course.nameRU}</h3>

                <div className={styles.cardInfo}>
                  <div className={styles.cardInfoItem}>
                    <img src="./img/Calendar.png" alt="calendar" />
                    {course.durationInDays} дней
                  </div>
                  <div className={styles.cardInfoItem}>
                    <img src="./img/Time.png" alt="time" />
                    {course.dailyDurationInMinutes.from}-{course.dailyDurationInMinutes.to} мин/день
                  </div>
                </div>

                <div className={styles.difficulty}>
                  <img src="./img/Group.png" alt="difficulty" />
                  <span className={styles.difficultyLabel}>Сложность</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CardsGrid;
