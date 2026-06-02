import { toast } from "react-toastify";
import styles from "./confirmToast.module.css";

export interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export const confirmWithToast = ({
  title = "Подтвердите действие",
  description = "Вы уверены?",
  confirmText = "Да",
  cancelText = "Отмена",
}: ConfirmOptions = {}): Promise<boolean> => {
  return new Promise((resolve) => {
    toast(
      ({ closeToast }) => (
        <div className={styles.toastContainer}>
          <p className={styles.title}>{title}</p>
          <p className={styles.description}>{description}</p>
          <div className={styles.buttons}>
            <button
              className={`${styles.button} ${styles.confirmButton}`}
              onClick={() => {
                resolve(true);
                closeToast?.();
              }}
              type="button"
            >
              {confirmText}
            </button>
            <button
              className={`${styles.button} ${styles.cancelButton}`}
              onClick={() => {
                resolve(false);
                closeToast?.();
              }}
              type="button"
            >
              {cancelText}
            </button>
          </div>
        </div>
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        position: "top-center",
        style: { width: "300px" },
      },
    );
  });
};
