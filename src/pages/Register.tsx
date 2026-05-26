// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { validatePassword } from "../utils/validatePassword";
// import styles from "./login.module.css";

// export const Register: React.FC = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [errors, setErrors] = useState<string[]>([]);

//   const { register, error: authError } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrors([]);

//     if (password !== confirmPassword) {
//       setErrors(["Пароли не совпадают"]);
//       return;
//     }

//     const validation = validatePassword(password);
//     if (!validation.isValid) {
//       setErrors(validation.errors);
//       return;
//     }

//     try {
//       await register(email, password);
//       navigate("/", { replace: true });
//     } catch {}
//   };

//   return (
//     <div className={styles.authPage} onClick={() => navigate(-1)}>
//       <form
//         onSubmit={handleSubmit}
//         className={styles.authForm}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className={styles.logoTop}>
//           <img src="./img/Logo.png" alt="logo" className={styles.logoIcon} />
//           <span className={styles.logoText}>SkyFitnessPro</span>
//         </div>

//         {(errors.length > 0 || authError) && (
//           <div className={styles.errorMessage}>
//             {(errors.length > 0 ? errors : [authError]).map((err, i) => (
//               <div key={i}>• {err}</div>
//             ))}
//           </div>
//         )}

//         <div className={styles.formGroup}>
//           <label htmlFor="reg-email"></label>
//           <input
//             id="reg-email"
//             name="email"
//             type="email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//             placeholder="Эл. почта"
//             autoComplete="email"
//           />
//         </div>

//         <div className={styles.formGroup}>
//           <label htmlFor="reg-password"></label>
//           <input
//             id="reg-password"
//             name="password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//             placeholder="Пароль"
//             autoComplete="new-password"
//           />
//           {/* <small>
//             Требования: 6+ символов, 2 спецсимвола (!@#$), 1 заглавная буква
//           </small> */}
//         </div>

//         <div className={styles.formGroup}>
//           <label htmlFor="reg-confirm"></label>
//           <input
//             id="reg-confirm"
//             name="confirmPassword"
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             required
//             placeholder="Повторите пароль"
//             autoComplete="new-password"
//           />
//         </div>

//         <div className={styles.btnForm}>
//           <button
//             className={styles.btnLog}
//             type="submit"
//             disabled={!email || !password || !confirmPassword}
//           >
//             Зарегистрироваться
//           </button>

//           <button
//             className={styles.btnReg}
//             type="button"
//             onClick={() => navigate("/login")}
//           >
//             Войти
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };
