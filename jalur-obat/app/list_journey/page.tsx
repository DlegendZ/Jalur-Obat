"use client";
import React, { useState, useEffect } from "react";
import JourneyCard from "./journey-card";
import styles from "./JourneyList.module.css";
import BottomNav from "../components/bottomNav";

export default function JourneyListPage() {
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("none");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<number | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  function parseDate(str: string) {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(year, month - 1, day);
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/list_journey`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const arr: any[] = [];

        (json.results_history || []).forEach((obj: any) => {
          const serial = Object.keys(obj)[0];
          const history = obj[serial] as any[];

          if (!history || history.length === 0) return;

          const latest = history[history.length - 1];

          arr.push({
            name: latest.medicine_name || "Unknown",
            id: serial,
            score:
              latest.ai_score_fake_result != null
                ? Number(latest.ai_score_fake_result)
                : 0,
            journeyStatus: latest.journey_status || "Unknown",
            updated: latest.timestamp
              ? latest.timestamp.split(" ")[0].split("-").reverse().join("/")
              : "",

            currentCondition: latest.overall_status || "Unknown",

            stages: history.map((h: any) => ({
              location: h.pos_code ?? h.current_location ?? "X",
              quantity: h.quantity != null ? Number(h.quantity) : 0,
              status: h.overall_status || "Unknown",
            })),
            status: latest.ai_journey_score || "N/A",
          });
        });

        setData(arr);
      } catch (e: any) {
        console.error(e);
        setError(e.message || "Gagal fetch data");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const filteredData = data
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
        {loading && <div style={{ padding: 16, textAlign: 'center' }}>Loading...</div>}
        {error && !loading && (
          <div style={{ padding: 16, color: "red", textAlign: 'center', fontWeight: 'bold' }}>
            Failed to load data. Check your connection to the server. :(
          </div>
        )}
        {!loading && !error && filteredData.length === 0 && (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: '#03254c', fontSize: '16px' }}>
            Still Empty.
          </div>
        )}
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

