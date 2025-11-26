"use client";

import React from "react";
import styles from "./JourneyList.module.css";

export default function JourneyCard({ data }) {
  return (
    <div className={styles.card}>
      {/* HEADER */}
      <div className={styles.cardHeader}>
        <div className={styles.titleBlock}>
          {data.name} – {data.id}
        </div>

        <div className={styles.statusBlock}>
          <span className={styles.onGoing}>On Going</span>
          <span className={styles.updated}>Last Updated: {data.updated}</span>
        </div>
      </div>

      <div className={styles.separator}></div>

      {/* DOT LINE */}
      <div className={styles.lineWrapper}>
        <div className={styles.line}></div>

        <div className={styles.dotRow}>
          {data.stages.map((s, i) => (
            <div key={i} className={styles.dot}></div>
          ))}
        </div>
      </div>

      {/* LETTERS */}
      <div className={styles.letterRow}>
        {data.stages.map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>

      {/* BOTTOM */}
      <div className={styles.bottomRow}>
        <span className={styles.aiScore}>AI Score: {data.score}%</span>
        <span className={styles.statusText}>{data.status}</span>
      </div>
    </div>
  );
}

