import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Course,
  getUserCourses,
  removeUserCourse,
  getCourseProgress,
  CourseProgress,
  getCourseWorkouts,
} from "../../api/courseService";
import styles from "./Profile.module.css";

interface UserCourse extends Course {
  progress: number;
  status: "not_started" | "in_progress" | "completed";
}

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateCourseProgress = (
    progress: CourseProgress | null,
    totalWorkouts: number,
  ): number => {
    if (!progress || totalWorkouts === 0) return 0;
    const completed = progress.workoutsProgress.filter(
      (w) => w.workoutCompleted,
    ).length;
    return Math.round((completed / totalWorkouts) * 100);
  };

  const getCourseStatus = (progress: number): UserCourse["status"] => {
    if (progress === 0) return "not_started";
    if (progress === 100) return "completed";
    return "in_progress";
  };

  useEffect(() => {
    const fetchUserCourses = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);

        const courses = await getUserCourses();

        const coursesWithProgress = await Promise.all(
          courses.map(async (course) => {
            try {
              const progress = await getCourseProgress(course._id);
              const progressPercent = calculateCourseProgress(
                progress,
                course.workouts?.length || 0,
              );
              return {
                ...course,
                progress: progressPercent,
                status: getCourseStatus(progressPercent),
              } as UserCourse;
            } catch {
              return {
                ...course,
                progress: 0,
                status: "not_started",
              } as UserCourse;
            }
          }),
        );

        setUserCourses(coursesWithProgress);
      } catch (err: any) {
        setError(err.response?.data?.message || "Не удалось загрузить курсы");
      } finally {
        setLoading(false);
      }
    };
    fetchUserCourses();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleStartCourse = async (courseId: string) => {
    try {
      const workouts = await getCourseWorkouts(courseId);

      if (workouts && workouts.length > 0) {
        navigate(`/courses/${courseId}/workout/${workouts[0]._id}`);
      } else {
        alert("Тренировки для этого курса пока не доступны");
        navigate(`/courses/${courseId}`);
      }
    } catch (err: any) {
      console.error("Ошибка получения тренировок:", err);
      alert("Не удалось загрузить тренировки");
      navigate(`/courses/${courseId}`);
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    if (!window.confirm("Удалить этот курс?")) return;
    try {
      await removeUserCourse(courseId);
      setUserCourses(userCourses.filter((c) => c._id !== courseId));
    } catch (err: any) {
      alert("Ошибка: " + (err.response?.data?.message || "Попробуйте снова"));
    }
  };

  const getButtonText = (status: UserCourse["status"]) => {
    const map = {
      not_started: "Начать тренировки",
      in_progress: "Продолжить",
      completed: "Начать заново",
    };
    return map[status] || "Начать";
  };

  const getDifficultyText = (d: string) =>
    ({ легкий: "Лёгкий", средний: "Средний", сложный: "Сложный" })[d] || d;

  const getCourseImage = (name: string) =>
    ({
      Йога: "/img/Maskgroup.png",
      Стретчинг: "/img/Maskgroup1.png",
      Фитнес: "/img/Maskgroup2.png",
      "Степ-аэробика": "/img/Maskgroup3.png",
      Бодифлекс: "/img/Maskgroup4.png",
    })[name] || "/img/placeholder.png";

  if (loading)
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Загрузка...</p>
      </div>
    );
  if (error || !user)
    return (
      <div className={styles.error}>
        <h2>{error || "Ошибка"}</h2>
        <button onClick={() => navigate("/")}>← На главную</button>
      </div>
    );

  return (
    <div className={styles.profilePage}>
      <h1 className={styles.pageTitle}>Профиль</h1>

      <div className={styles.userCard}>
        <div className={styles.userAvatar}>
          <div className={styles.avatarStack}>
            <img src="/img/userBg.svg" alt="" className={styles.avatarBg} />

            <img src="/img/userBgTop.png" alt="" className={styles.avatarTop} />

            <img src="/img/userBgBtm.png" alt="" className={styles.avatarBtm} />
          </div>
        </div>
        <div className={styles.userInfo}>
          <h2 className={styles.userName}>
            {user.email.split("@")[0].charAt(0).toUpperCase() +
              user.email.split("@")[0].slice(1)}
          </h2>
          <p className={styles.userEmail}>Логин: {user.email}</p>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Выйти
          </button>
        </div>
      </div>

      <section className={styles.coursesSection}>
        <h2 className={styles.sectionTitle}>Мои курсы</h2>
        {userCourses.length === 0 ? (
          <div className={styles.noCourses}>
            <p>У вас пока нет курсов</p>
            <button
              className={styles.browseButton}
              onClick={() => navigate("/")}
            >
              Перейти к каталогу
            </button>
          </div>
        ) : (
          <div className={styles.coursesGrid}>
            {userCourses.map((course) => (
              <div key={course._id} className={styles.courseCard}>
                <div className={styles.courseHeader}>
                  <div className={styles.courseImageWrapper}>
                    <img
                      src={getCourseImage(course.nameRU)}
                      alt={course.nameRU}
                      className={styles.courseImage}
                      onError={(e) =>
                        ((e.target as HTMLImageElement).style.display = "none")
                      }
                    />
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={() => handleRemoveCourse(course._id)}
                    aria-label="Удалить курс"
                  >
                    −<span className={styles.tooltip}>Удалить курс</span>
                  </button>
                </div>
                <div className={styles.courseContent}>
                  <h3 className={styles.courseTitle}>{course.nameRU}</h3>
                  <div className={styles.courseMeta}>
                    <span className={styles.metaItem}>
                      {course.durationInDays} дней
                    </span>
                    <span className={styles.metaItem}>
                      {course.dailyDurationInMinutes.from}-
                      {course.dailyDurationInMinutes.to} мин
                    </span>
                  </div>
                  <div className={styles.difficulty}>
                    {getDifficultyText(course.difficulty)}
                  </div>
                  <div className={styles.progressSection}>
                    <div className={styles.progressLabel}>
                      Прогресс: {course.progress}%
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  <button
                    className={styles.actionButton}
                    onClick={() => handleStartCourse(course._id)}
                  >
                    {getButtonText(course.status)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
