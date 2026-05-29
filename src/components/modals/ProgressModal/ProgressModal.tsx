import React, { useState } from "react";
import styles from "./ProgressModal.module.css";
import { ProgressModalProps } from "@/types/index";

export const ProgressModal: React.FC<ProgressModalProps> = ({ exercises, onClose, onSave }) => {
  const [values, setValues] = useState<Record<string, string>>(
    exercises.reduce((acc, ex) => ({ ...acc, [ex._id]: "" }), {}),
  );

  const handleChange = (id: string, value: string) => {
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = () => {
    const numericValues: Record<string, number> = {};
    exercises.forEach((ex) => {
      const val = values[ex._id];
      numericValues[ex._id] = val === "" ? 0 : Math.max(0, parseInt(val, 10));
    });
    onSave(numericValues);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Мой прогресс</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.questionsList}>
          {exercises.length === 0 ? (
            <p>Нет упражнений для отображения</p>
          ) : (
            exercises.map((exercise) => (
              <div key={exercise._id} className={styles.questionItem}>
                <label className={styles.questionLabel}>
                  Сколько раз сделали: <strong>{exercise.name}</strong>?
                </label>
                <input
                  type="number"
                  min="0"
                  value={values[exercise._id]}
                  onChange={(e) => handleChange(exercise._id, e.target.value)}
                  className={styles.numberInput}
                  placeholder={"0"}
                />
              </div>
            ))
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.saveButton} onClick={handleSave}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};
