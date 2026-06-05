import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { WorkoutFilterModal } from "@/components/modals/WorkoutFilterModal/WorkoutFilterModal";
import styles from "./Profile.module.css";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Course } from "@/types";

const getCourseImage = (name: string): string => {
  const images: Record<string, string> = {
    Йога: "/img/Maskgroup.png",
    Стретчинг: "/img/Maskgroup1.png",
    Фитнес: "/img/Maskgroup2.png",
    "Степ-аэробика": "/img/Maskgroup3.png",
    Бодифлекс: "/img/Maskgroup4.png",
  };
  return images[name] || "/img/placeholder.png";
};

const getDifficultyText = (d: string): string => {
  const map: Record<string, string> = {
    легкий: "Лёгкий",
    средний: "Средний",
    сложный: "Сложный",
  };
  return map[d] || d;
};

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState<Set<string>>(new Set());

  const {
    userCourses,
    loading,
    error,
    handleStartCourse,
    handleRemoveCourse,
    handleRestartCourse,
    isWorkoutModalOpen,
    selectedCourseId,
    courseWorkouts,
    workoutsLoading,
    handleWorkoutSelect,
    closeWorkoutModal,
  } = useUserProfile();

  const loadCourseProgress = async (courseId: string) => {
    const course = userCourses.find((c) => c._id === courseId);
    if (course && course.progress > 0) {
      return;
    }

    setLoadingProgress((prev: Set<string>) => new Set(prev).add(courseId));

    setTimeout(() => {
      setLoadingProgress((prev: Set<string>) => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });
    }, 500);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Загрузка профиля...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles.error}>
        <h2>{error || "Ошибка"}</h2>
        <button onClick={() => navigate("/")}>← На главную</button>
      </div>
    );
  }

  const getUserName = () => {
    if (!user?.email) return "Пользователь";
    const name = user.email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const getButtonText = (status: "not_started" | "in_progress" | "completed") => {
    const map: Record<string, string> = {
      not_started: "Начать тренировки",
      in_progress: "Продолжить",
      completed: "Начать заново",
    };
    return map[status] || "Начать";
  };

  const coursesToRender = userCourses || [];

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
          <h2 className={styles.userName}>{getUserName()}</h2>
          <p className={styles.userEmail}>Логин: {user.email}</p>
          <button className={styles.logoutButton} onClick={logout}>
            Выйти
          </button>
        </div>
      </div>

      <section className={styles.coursesSection}>
        <h2 className={styles.sectionTitle}>Мои курсы</h2>

        {coursesToRender.length === 0 ? (
          <div className={styles.noCourses}>
            <p>У вас пока нет курсов</p>
            <button className={styles.browseButton} onClick={() => navigate("/")}>
              Перейти к каталогу
            </button>
          </div>
        ) : (
          <div className={styles.coursesGrid}>
            {coursesToRender.map((course) => (
              <div
                key={course._id}
                className={styles.courseCard}
                onClick={() => {
                  loadCourseProgress(course._id);
                  course.status === "completed"
                    ? handleRestartCourse(course._id)
                    : handleStartCourse(course._id);
                }}
                role="button"
                tabIndex={0}
                aria-label={`Открыть курс "${course.nameRU}"`}
              >
                <div className={styles.courseHeader}>
                  <div className={styles.courseImageWrapper}>
                    <img
                      src={getCourseImage(course.nameRU)}
                      alt={course.nameRU}
                      className={styles.courseImage}
                      onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                    />
                  </div>
                  <button
                    className={styles.removeButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleRemoveCourse(course._id);
                    }}
                    onMouseEnter={() => setTooltipVisible(course._id)}
                    onMouseLeave={() => setTooltipVisible(null)}
                    onFocus={() => setTooltipVisible(course._id)}
                    onBlur={() => setTooltipVisible(null)}
                    aria-label="Удалить курс"
                  >
                    −
                    {tooltipVisible === course._id && (
                      <span className={styles.tooltip}>Удалить курс</span>
                    )}
                  </button>
                </div>
                <div className={styles.courseContent}>
                  <h3 className={styles.courseTitle}>{course.nameRU}</h3>
                  <div className="courseBlock">
                    <div className={styles.courseMeta}>
                      <span className={styles.metaItem}>
                        <img src="/img/Calendar.png" alt="calendar" /> {course.durationInDays} дней
                      </span>
                      <span className={styles.metaItem}>
                        <img src="/img/Time.png" alt="time" /> {course.dailyDurationInMinutes.from}-
                        {course.dailyDurationInMinutes.to} мин
                      </span>
                    </div>
                    <div className={styles.difficulty}>
                      <img src="/img/Group.png" alt="difficulty" />{" "}
                      {getDifficultyText(course.difficulty)}
                    </div>
                    <div className={styles.progressSection}>
                      <div className={styles.progressLabel}>
                        Прогресс:{" "}
                        {loadingProgress.has(course._id) ? "Загрузка..." : `${course.progress}%`}
                      </div>
                      <div className={styles.progressBar}>
                        <div
                          className={styles.progressFill}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    className={styles.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      loadCourseProgress(course._id);
                      course.status === "completed"
                        ? handleRestartCourse(course._id)
                        : handleStartCourse(course._id);
                    }}
                  >
                    {getButtonText(course.status)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {isWorkoutModalOpen && selectedCourseId && (
        <WorkoutFilterModal
          workouts={courseWorkouts}
          courseName={userCourses.find((c: Course) => c._id === selectedCourseId)?.nameRU || ""}
          onClose={closeWorkoutModal}
          onSelect={handleWorkoutSelect}
        />
      )}

      {workoutsLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <p>Загрузка тренировок...</p>
        </div>
      )}

      <button
        className={styles.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Наверх ↑
      </button>
    </div>
  );
};

export default Profile;
