import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import styles from "./login.module.css";

interface RegisterModalProps {
  onClose: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, error: authError, clearError, openLoginModal } = useAuth();
  const emailRef = useRef<HTMLInputElement>(null);

  const errorMessage = formError || authError;

  useEffect(() => {
    if (errorMessage && emailRef.current) {
      emailRef.current.focus();
    }
  }, [errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password || !confirmPassword) {
      setFormError("Заполните все поля");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setFormError("Пароль должен содержать минимум 6 символов");
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("уже существует")) {
        setFormError("Этот email уже зарегистрирован. Попробуйте войти.");
      } else {
        setFormError(message || "Ошибка регистрации");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllErrors = () => {
    setFormError("");
    clearError();
  };

  return (
    <div className={styles.authPage} onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className={styles.authForm}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.logoTop}>
          <img src="/img/logo.png" alt="logo" className={styles.logoIcon} />
        </div>

        {errorMessage && (
          <div className={styles.errorMessage} role="alert">
            {errorMessage}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="reg-email"></label>
          <input
            ref={emailRef}
            id="reg-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearAllErrors();
            }}
            required
            placeholder="Эл. почта"
            autoComplete="email"
            aria-invalid={!!errorMessage}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="reg-password"></label>
          <input
            id="reg-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearAllErrors();
            }}
            required
            placeholder="Пароль"
            autoComplete="new-password"
            aria-invalid={!!errorMessage}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="reg-confirm"></label>
          <input
            id="reg-confirm"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearAllErrors();
            }}
            required
            placeholder="Повторите пароль"
            autoComplete="new-password"
            aria-invalid={!!errorMessage}
          />
        </div>

        <div className={styles.btnForm}>
          <button
            className={styles.btnLog}
            type="submit"
            disabled={isLoading || !email || !password || !confirmPassword}
          >
            {isLoading ? "Регистрация..." : "Зарегистрироваться"}
          </button>

          <button
            className={styles.btnReg}
            type="button"
            onClick={() => {
              clearAllErrors();
              onClose();
              setTimeout(openLoginModal, 100);
            }}
          >
            Войти
          </button>
        </div>
      </form>
    </div>
  );
};
