import React, { useState } from "react";
import styles from "./WorkoutFilterModal.module.css";
import { Workout } from "@/types";
import { toast } from "react-toastify";

interface WorkoutFilterModalProps {
  workouts: Workout[];
  onClose: () => void;
  onSelect: (workoutId: string) => void;
  courseName: string;
}

export const WorkoutFilterModal: React.FC<WorkoutFilterModalProps> = ({
  workouts,
  onClose,
  onSelect,
  courseName,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  const filteredWorkouts = workouts.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const groupWorkoutsByDay = (workoutsToGroup: typeof workouts) => {
    const groups: { [key: string]: typeof workouts } = {};

    workoutsToGroup.forEach((workout) => {
      const match = workout.name.match(/(День|Day)\s+(\d+)/i);
      const dayKey = match ? `День ${match[2]}` : "";

      if (!groups[dayKey]) {
        groups[dayKey] = [];
      }
      groups[dayKey].push(workout);
    });

    return groups;
  };

  const workoutGroups = groupWorkoutsByDay(filteredWorkouts);

  const handleSelect = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
  };

  const handleStart = () => {
    if (!selectedWorkoutId) {
      toast.success("Выберите тренировку");
      return;
    }
    onSelect(selectedWorkoutId);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Выберите тренировку</h2>
          <p className={styles.modalSubtitle}>{courseName}</p>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Поиск тренировки..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.workoutList}>
          {Object.keys(workoutGroups).length === 0 ? (
            <p className={styles.emptyMessage}>Тренировки не найдены</p>
          ) : (
            Object.entries(workoutGroups).map(([day, dayWorkouts]) => (
              <div key={day} className={styles.workoutGroup}>
                <h3 className={styles.groupTitle}>{day}</h3>
                {dayWorkouts.map((workout) => (
                  <label
                    key={workout._id}
                    className={`${styles.workoutItem} ${
                      selectedWorkoutId === workout._id ? styles.selected : ""
                    }`}
                    onClick={() => handleSelect(workout._id)}
                  >
                    <span
                      className={`${styles.checkbox} ${
                        selectedWorkoutId === workout._id ? styles.checked : ""
                      }`}
                    />
                    <div className={styles.workoutInfo}>
                      <h3 className={styles.workoutName}>{workout.name}</h3>
                      <span className={styles.exerciseCount}>
                        {workout.exercises.length} упражнений
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            ))
          )}
        </div>
        <div className={styles.modalFooter}>
          <button
            className={styles.startButton}
            onClick={handleStart}
            disabled={!selectedWorkoutId}
          >
            Начать
          </button>
        </div>
      </div>
    </div>
  );
};
