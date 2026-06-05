import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/useIsMobile";
import styles from "./Header.module.css";
import logoMobile from "@/assets/logoMobile.png";
import logoDesktop from "@/assets/logo.png";
import profileIcon from "@/assets/profile.png";

interface HeaderProps {
  onLoginClick: () => void;
  onRegisterClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick, onRegisterClick: _ }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(400);
  const showTagline = location.pathname === "/";

  const handleProfileClick = () => {
    navigate("/profile");
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/");
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  const logoSrc = isMobile ? logoMobile : logoDesktop;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getUserName = () => {
    if (!user?.email) return "";
    const name = user.email.split("@")[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <header className={styles.header}>
      <div className={styles.logoBlock} onClick={handleLogoClick}>
        <img src={logoSrc} alt="SkyFitnessPro" className={styles.logoImage} />

        {showTagline && <p className={styles.tagline}>Онлайн-тренировки для занятий дома</p>}
      </div>
      <div className={styles.headerActions}>
        {user ? (
          <div className={styles.profileDropdown} ref={dropdownRef}>
            <button
              className={styles.profileButton}
              onClick={toggleDropdown}
              aria-label="Открыть профиль"
            >
              <img src={profileIcon} alt="user" />

              <span className={styles.profileName}>{getUserName()}</span>
              <svg
                className={`${styles.dropdownArrow} ${isDropdownOpen ? styles.arrowUp : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.dropdownHeader}>
                  <div className={styles.dropdownUserName}>{getUserName()}</div>
                  <div className={styles.dropdownUserEmail}>{user.email}</div>
                </div>

                <button className={styles.dropdownMenuItem} onClick={handleProfileClick}>
                  Мой профиль
                </button>

                <button
                  className={`${styles.dropdownMenuItemClose} ${styles.logoutItem}`}
                  onClick={handleLogoutClick}
                >
                  Выйти
                </button>
              </div>
            )}
          </div>
        ) : (
          <button className={styles.loginBtn} onClick={onLoginClick}>
            Войти
          </button>
        )}
      </div>
    </header>
  );
};
