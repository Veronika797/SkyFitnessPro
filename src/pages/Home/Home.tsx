import React from "react";
import styles from "./Home.module.css";
import CardsGrid from "../../components/CardsGrid/CardsGrid";

export const Home: React.FC = () => {
  return (
    <main className={styles.hero}>
      <div className={styles.heroContent}>
        <h1 className={styles.heroTitle}>
          Начните заниматься спортом и улучшите качество жизни
        </h1>
        <div className={styles.heroBadge}>Измени своё тело за полгода!</div>
      </div>
      <CardsGrid />

      <button
        className={styles.backToTop}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      >
        Наверх ↑
      </button>
    </main>
  );
};
