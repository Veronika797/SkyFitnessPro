import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import styles from "./login.module.css";

interface LoginModalProps {
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const getLoginErrorMessage = (error: string | null): string | null => {
  if (!error) return null;

  if (error.includes("Неверный пароль")) {
    return "Пароль введен неверно, попробуйте еще раз.";
  }

  if (error.includes("Пользователь с таким email не найден")) {
    return "Пользователь с такой почтой не найден. Зарегистрируйтесь?";
  }

  if (error.includes("уже существует")) {
    return "Данная почта уже используется. Попробуйте войти.";
  }

  return "Произошла ошибка. Проверьте данные и попробуйте снова.";
};

export const LoginModal: React.FC<LoginModalProps> = ({
  onClose,
  onSwitchToRegister,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: Location })?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!email || !password) {
      setFormError("Заполните все поля");
      return;
    }

    try {
      await login(email, password);
      onClose();
      navigate(from, { replace: true });
    } catch (err) {}
  };

  const errorMessage = formError || getLoginErrorMessage(authError);

  return (
    <div className={styles.authPage} onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        className={styles.authForm}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.logoTop}>
          <img src="./img/Logo.png" alt="logo" className={styles.logoIcon} />
          <span className={styles.logoText}>SkyFitnessPro</span>
        </div>

        {errorMessage && (
          <div className={styles.errorMessage}>{errorMessage}</div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="email"></label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Логин"
            autoComplete="email"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password"></label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Пароль"
            autoComplete="current-password"
          />
        </div>

        <div className={styles.btnForm}>
          <button
            className={styles.btnLog}
            type="submit"
            disabled={!email || !password}
          >
            Войти
          </button>

          <button
            className={styles.btnReg}
            type="button"
            onClick={onSwitchToRegister}
          >
            Зарегистрироваться
          </button>
        </div>
      </form>
    </div>
  );
};
