import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validatePassword } from "../../utils/validatePassword";
import styles from "./login.module.css";

interface RegisterModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const getRegisterErrorMessage = (error: string | null): string | null => {
  if (!error) return null;

  if (error.includes("Введите корректный Email")) {
    return "Введите корректный Email, например: user@example.com";
  }

  if (error.includes("Пользователь с таким email уже существует")) {
    return "Данная почта уже используется. Попробуйте войти.";
  }

  if (error.includes("не менее 6 символов")) {
    return "Пароль должен содержать не менее 6 символов.";
  }

  if (error.includes("не менее 2 спецсимволов")) {
    return "Пароль должен содержать не менее 2 спецсимволов (например, @, !, #).";
  }

  if (error.includes("заглавную букву")) {
    return "Пароль должен содержать хотя бы одну заглавную букву (A–Я).";
  }

  return "Произошла ошибка при регистрации. Проверьте данные и попробуйте снова.";
};

export const RegisterModal: React.FC<RegisterModalProps> = ({
  onClose,
  onSwitchToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const { register, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);

    if (password !== confirmPassword) {
      setErrors(["Пароли не совпадают"]);
      return;
    }

    const validation = validatePassword(password);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await register(email, password);
      onClose();
      navigate("/", { replace: true });
    } catch {}
  };

  const backendMessage = getRegisterErrorMessage(authError);
  const allErrors = [...errors, ...(backendMessage ? [backendMessage] : [])];

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

        {allErrors.length > 0 && (
          <div className={styles.errorMessage}>
            {allErrors.map((err, i) => (
              <div key={i}> {err}</div>
            ))}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="reg-email"></label>
          <input
            id="reg-email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Эл. почта"
            autoComplete="email"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="reg-password"></label>
          <input
            id="reg-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Пароль"
            autoComplete="new-password"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="reg-confirm"></label>
          <input
            id="reg-confirm"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="Повторите пароль"
            autoComplete="new-password"
          />
        </div>

        <div className={styles.btnForm}>
          <button
            className={styles.btnLog}
            type="submit"
            disabled={!email || !password || !confirmPassword}
          >
            Зарегистрироваться
          </button>

          <button
            className={styles.btnReg}
            type="button"
            onClick={onSwitchToLogin}
          >
            Войти
          </button>
        </div>
      </form>
    </div>
  );
};
