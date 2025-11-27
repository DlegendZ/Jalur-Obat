"use client";
import React from "react";
import styles from "./JourneyList.module.css";

export default function JourneyCard({ data, isExpanded, onClick }: { 
  data: any; 
  isExpanded: boolean;
  onClick: () => void;
}) {
  // Sample data for expanded view
  const stageDetails = {
    "A": { quantity: "1000 pcs", quality: "Excellent" },
    "B": { quantity: "980 pcs", quality: "Excellent" },
    "D": { quantity: "950 pcs", quality: "Good" },
    "E": { quantity: "920 pcs", quality: "Good" },
    "M": { quantity: "900 pcs", quality: "Fair" },
    "F": { quantity: "890 pcs", quality: "Fair" },
    "P": { quantity: "880 pcs", quality: "Poor" },
    "Z": { quantity: "870 pcs", quality: "Poor" },
    "O": { quantity: "860 pcs", quality: "Poor" }
  };

  const currentStage = data.stages[data.stages.length - 1]; // Last stage

  return (
    <div className={`${styles.card} ${isExpanded ? styles.expanded : ''}`} onClick={onClick}>
      {/* HEADER - Nama dan ID sejajar dan bold */}
      <div className={styles.cardHeader}>
        <div className={styles.nameIdRow}>
          <span className={styles.drugName}>{data.name} -</span>
          <span className={styles.drugId}>{data.id}</span>
        </div>
      </div>

      {/* DOT LINE - Horizontal atau Vertikal */}
      <div className={`${styles.dotLineContainer} ${isExpanded ? styles.vertical : styles.horizontal}`}>
        {isExpanded ? (
          // VERTICAL LAYOUT (Expanded)
          <div className={styles.verticalStages}>
            <div className={styles.verticalLine}></div>
            {data.stages.map((stage: string, index: number) => (
              <div key={index} className={styles.verticalStage}>
                <div className={styles.verticalDot}></div>
                <div className={styles.stageInfo}>
                  <span className={styles.stageLetter}>{stage}</span>
                  <span className={styles.stageQuantity}>{stageDetails[stage as keyof typeof stageDetails]?.quantity}</span>
                  <span className={styles.stageQuality}>{stageDetails[stage as keyof typeof stageDetails]?.quality}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // HORIZONTAL LAYOUT (Collapsed)
          <>
            <div className={styles.connectingLine}></div>
            <div className={styles.dotLine}>
              {data.stages.map((stage: string, index: number) => (
                <div key={index} className={styles.dotStage}>
                  <div className={styles.dot}></div>
                  <span className={styles.stageLetter}>{stage}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* AI SCORE */}
      <div className={styles.aiScoreRow}>
        <span className={styles.aiScore}>AI Score : {data.score}%</span>
      </div>

      {/* STATUS AND UPDATE INFO */}
      <div className={styles.statusUpdateRow}>
        <div className={styles.statusLeft}>
          <span className={styles.onGoing}>On Going</span>
          <span className={styles.lastUpdated}>Last Updated : {data.updated}</span>
        </div>
        <div className={styles.statusRight}>
          <span className={styles.statusText}>{data.status}</span>
        </div>
      </div>

      {/* CURRENT CONDITION */}
      {isExpanded && (
        <div className={styles.currentCondition}>
          <span className={styles.currentConditionLabel}>Current Condition:</span>
          <span className={styles.currentConditionValue}>{stageDetails[currentStage as keyof typeof stageDetails]?.quality}</span>
        </div>
      )}
    </div>
  );
}