"use client";

import React, { useState } from "react";
import JourneyCard from "./journey-card";
import styles from "./JourneyList.module.css";

const dummyData = [
  {
    name: "OBH KOMIK",
    id: "84929927492",
    score: 94,
    updated: "22/2/2022",
    stages: ["A", "B", "D", "E", "M", "F", "P", "Z", "O"],
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
  // STATE
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("none");

  // Fix parsing tanggal dd/mm/yyyy
  function parseDate(str) {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  // FILTER + SORT
  const filteredData = dummyData
    .filter((d) =>
      (d.name + d.id).toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortType === "score") return b.score - a.score;
      if (sortType === "updated")
        return parseDate(b.updated) - parseDate(a.updated);
      return 0;
    });

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Journey List</h1>
        <img src="/logo.png" className={styles.logo} alt="logo" />
      </div>

      {/* FILTER SECTION */}
      <div className={styles.filterRow}>
        <input
          className={styles.search}
          placeholder="Search by ID / Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className={styles.filterBtn}
          onClick={() => alert("Filter menu not implemented yet")}
        >
          Filter By
        </button>

        <button
          className={styles.sortBtn}
          onClick={() =>
            setSortType(sortType === "score" ? "updated" : "score")
          }
        >
          Sort By
        </button>
      </div>

      {/* CARD LIST */}
      {filteredData.map((item, idx) => (
        <JourneyCard key={idx} data={item} />
      ))}

      {/* BOTTOM NAV */}
      <div className={styles.bottomNav}>
        <div className={styles.navItem}>
          <a href="/journey-update">
            <img src="/update.png" className={styles.navIcon} />
            <p>Journey Update</p>
          </a>
        </div>

        <div className={`${styles.navItem} ${styles.activeNav}`}>
          <a href="/journey-list">
            <img src="/list.png" className={styles.navIcon} />
            <p>Journey List</p>
          </a>
        </div>

        <div className={styles.navItem}>
          <a href="/settings">
            <img src="/settings.png" className={styles.navIcon} />
            <p>Settings</p>
          </a>
        </div>
      </div>
    </div>
  );
}
