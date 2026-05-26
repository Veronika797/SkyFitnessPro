import React from "react";
import styles from "./CardsGrid.module.css";
import { useNavigate } from "react-router-dom";

interface CardData {
  id: string;
  title: string;
  image: string;
  days: string;
  duration: string;
  difficulty: number; // 1-5
  bgColor: string;
}

const cards: CardData[] = [
  {
    id: "yoga",
    title: "Йога",
    image: "./img/Mask group.png",
    days: "25 дней",
    duration: "20-50 мин/день",
    difficulty: 3,
    bgColor: styles.bgYoga,
  },
  {
    id: "stretching",
    title: "Стретчинг",
    image: "./img/Mask group (1).png",
    days: "25 дней",
    duration: "20-50 мин/день",
    difficulty: 2,
    bgColor: styles.bgStretching,
  },
  {
    id: "fitness",
    title: "Фитнес",
    image: "./img/Mask group (2).png",
    days: "25 дней",
    duration: "20-50 мин/день",
    difficulty: 4,
    bgColor: styles.bgFitness,
  },
  {
    id: "step",
    title: "Степ-аэробика",
    image: "./img/Mask group (3).png",
    days: "25 дней",
    duration: "20-50 мин/день",
    difficulty: 4,
    bgColor: styles.bgStep,
  },
  {
    id: "bodyflex",
    title: "Бодифлекс",
    image: "./img/Mask group (4).png",
    days: "25 дней",
    duration: "20-50 мин/день",
    difficulty: 2,
    bgColor: styles.bgBodyflex,
  },
];

export const CardsGrid: React.FC = () => {
  const navigate = useNavigate();

  const handleAddClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const btn = e.currentTarget;

    btn.style.background = "#7fff00";
    btn.textContent = "✓";

    setTimeout(() => {
      btn.style.background = "#fff";
      btn.textContent = "+";
    }, 1500);

    console.log("Added to favorites");
  };

  const handleCardClick = (cardId: string) => {
    console.log("Card clicked:", cardId);
    navigate(`/courses/${cardId}`);
  };

  return (
    <div className={styles.cardsGrid}>
      {cards.map((card) => (
        <div
          key={card.id}
          className={styles.cardWrapper}
          onClick={() => handleCardClick(card.id)}
        >
          <button
            className={`${styles.cardAddBtn} ${card.bgColor}`}
            aria-label={`Добавить ${card.title} в избранное`}
            onClick={handleAddClick}
          >
            +<span className={styles.tooltip}>Добавить курс</span>
          </button>

          <div className={styles.card}>
            <div className={`${styles.cardImage} ${card.bgColor}`}>
              <img src={card.image} alt={card.title} />
            </div>

            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{card.title}</h3>

              <div className={styles.cardInfo}>
                <div className={styles.cardInfoItem}>
                  <img src="./img/Calendar.png" alt="calendar" />
                  {card.days}
                </div>
                <div className={styles.cardInfoItem}>
                  <img src="./img/Time.png" alt="time" />
                  {card.duration}
                </div>
              </div>

              <div className={styles.difficulty}>
                <img src="./img/Group.png" alt="difficulty" />
                <span className={styles.difficultyLabel}>Сложность</span>
                {/* <div className={styles.difficultyBar}>
                  {renderDifficulty(card.difficulty)}
                </div> */}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardsGrid;
