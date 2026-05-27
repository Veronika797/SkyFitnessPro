import React, { useEffect, useState } from "react";
import styles from "./CardsGrid.module.css";
import { useNavigate } from "react-router-dom";
import { getAllCourses, Course } from "../../api/courseService";

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
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getAllCourses();
        setCourses(data);
      } catch (err) {
        console.error("Ошибка загрузки курсов:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleAddClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    _courseId: string,
  ) => {
    e.stopPropagation();
    const btn = e.currentTarget;

    btn.style.background = "#7fff00";
    btn.textContent = "✓";

    setTimeout(() => {
      btn.style.background = "#fff";
      btn.textContent = "+";
    }, 1500);
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

  return (
    <div className={styles.cardsGrid}>
      {courses.map((course) => {
        const bgColor = COURSE_COLORS[course.nameRU] || "";
        const imageSrc =
          COURSE_IMAGES[course.nameRU] || "./img/placeholder.png";

        return (
          <div
            key={course._id}
            className={styles.cardWrapper}
            onClick={() => handleCardClick(course._id)}
          >
            <button
              className={`${styles.cardAddBtn} ${bgColor}`}
              aria-label={`Добавить ${course.nameRU} в избранное`}
              onClick={(e) => handleAddClick(e, course._id)}
            >
              +<span className={styles.tooltip}>Добавить курс</span>
            </button>

            <div className={styles.card}>
              <div className={`${styles.cardImage} ${bgColor}`}>
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
                    {course.dailyDurationInMinutes.from}-
                    {course.dailyDurationInMinutes.to} мин/день
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
