"use client";
import React, { useState } from "react";
import JourneyCard from "./journey-card";
import styles from "./JourneyList.module.css";
import BottomNav from "../components/bottomNav";

const dummyData = [
  {
    name: "OBH KOMIK",
    id: "84929927492",
    score: 94,
    updated: "22/2/2022",
    stages: ["A", "B", "D", "E", "M", "F", "P", "Z"],
    status: "Safe",
  },
  {
    name: "EXTRA JOSS",
    id: "12345678900",
    score: 87,
    updated: "21/2/2022",
    stages: ["A", "B", "D", "E", "M", "F", "P"],
    status: "Stable",
  },
];

export default function JourneyListPage() {
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("none");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  function parseDate(str: string) {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  const filteredData = dummyData
    .filter((d) =>
      (d.name + d.id).toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === "score") return b.score - a.score;
      if (sortType === "updated")
        return parseDate(b.updated).getTime() - parseDate(a.updated).getTime();
      return 0;
    });

  const handleCardClick = (index: number) => {
    setSelectedCard(selectedCard === index ? null : index);
  };

  return (
    <div className={styles.root}>
      <div className={styles.phone}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Journey List</h1>
          <img src="/app_logo.png" className={styles.logo} alt="logo" />
        </div>

        <div className={styles.searchFilterRow}>
          <input
            className={styles.search}
            placeholder="Search by ID / Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className={styles.filterButtons}>
            <div className={styles.filterGroup}>
              <button
                className={styles.filterBtn}
                onClick={() => setFilterOpen(!filterOpen)}
              >
                Filter By
              </button>
              {filterOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.option}>All</div>
                  <div className={styles.option}>On Going</div>
                  <div className={styles.option}>Completed</div>
                </div>
              )}
            </div>

            <div className={styles.filterGroup}>
              <button
                className={styles.sortBtn}
                onClick={() => setSortOpen(!sortOpen)}
              >
                Sort By
              </button>
              {sortOpen && (
                <div className={styles.dropdown}>
                  <div
                    className={styles.option}
                    onClick={() => setSortType("score")}
                  >
                    AI Score
                  </div>
                  <div
                    className={styles.option}
                    onClick={() => setSortType("updated")}
                  >
                    Last Updated
                  </div>
                  <div
                    className={styles.option}
                    onClick={() => setSortType("none")}
                  >
                    Default
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CARD LIST */}
        <div className={styles.cardList}>
          {filteredData.map((item, idx) => (
            <JourneyCard
              key={idx}
              data={item}
              isExpanded={selectedCard === idx}
              onClick={() => handleCardClick(idx)}
            />
          ))}
        </div>

        {/* BOTTOM NAV */}
        <BottomNav />
      </div>
    </div>
  );
}