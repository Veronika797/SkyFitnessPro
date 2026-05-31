import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import styles from "./login.module.css";

interface LoginModalProps {
  onClose: () => void;
}

const getLoginErrorMessage = (error: string | null): string | null => {
  if (!error) return null;
  if (error.includes("Неверный пароль")) return "Пароль введен неверно, попробуйте еще раз.";
  if (error.includes("Пользователь с таким email не найден"))
    return "Пользователь с такой почтой не найден. Зарегистрируйтесь?";
  if (error.includes("уже существует")) return "Данная почта уже используется. Попробуйте войти.";
  return "Произошла ошибка. Проверьте данные и попробуйте снова.";
};

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login, error: authError, clearError, openRegisterModal } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);

  const from = (location.state as { from?: Location })?.from?.pathname || "/";
  const errorMessage = formError || getLoginErrorMessage(authError);

  useEffect(() => {
    if (errorMessage && emailRef.current) {
      emailRef.current.focus();
    }
  }, [errorMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Заполните все поля");
      return;
    }
    setIsLoading(true);
    try {
      await login(email, password);
      navigate(from);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setFormError(getLoginErrorMessage(message) || message);
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
        aria-label="Форма входа"
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
          <label htmlFor="email"></label>
          <input
            ref={emailRef}
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearAllErrors();
            }}
            required
            placeholder="Логин"
            autoComplete="email"
            aria-invalid={!!errorMessage}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password"></label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearAllErrors();
            }}
            required
            placeholder="Пароль"
            autoComplete="current-password"
            aria-invalid={!!errorMessage}
          />
        </div>

        <div className={styles.btnForm}>
          <button
            className={styles.btnLog}
            type="submit"
            disabled={!email || !password || isLoading}
          >
            {isLoading ? "Вход..." : "Войти"}
          </button>

          <button
            className={styles.btnReg}
            type="button"
            onClick={() => {
              clearAllErrors();
              onClose();
              setTimeout(openRegisterModal, 100);
            }}
          >
            Зарегистрироваться
          </button>
        </div>
      </form>
    </div>
  );
};
