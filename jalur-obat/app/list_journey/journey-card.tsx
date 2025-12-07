"use client";
import React from "react";
import styles from "./JourneyList.module.css";
import { useRouter } from "next/navigation";

export default function JourneyCard({ data, isExpanded, onClick }: {
  data: any;
  isExpanded: boolean;
  onClick: () => void;
}) {

  const currentStage = (data.stages && data.stages.length > 0) ? data.stages[data.stages.length - 1] : null;

  const router = useRouter();

  const handleDetailClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/journey_detail/${encodeURIComponent(data.id)}`);
  };

  return (
    <div className={`${styles.card} ${isExpanded ? styles.expanded : ''}`} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.nameIdRow}>
          <span className={styles.drugName}>{data.name} -</span>
          <span className={styles.drugId}>{data.id}</span>
        </div>
      </div>

      <div className={`${styles.dotLineContainer} ${isExpanded ? styles.vertical : styles.horizontal}`}>
        {isExpanded ? (
          <div className={styles.verticalStages}>
            <div className={styles.verticalLine}></div>
            {data.stages.map((stage: any, index: number) => {

              return (
                <div key={index} className={styles.verticalStage}>
                  <div className={styles.verticalDot}></div>
                  <div className={styles.stageInfo}>
                    <span className={styles.stageLetter}>{stage.location}</span>
                    <span className={styles.stageQuantity}>{stage.quantity}</span>
                    <span className={styles.stageQuality}>{stage.status}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <>
            <div className={styles.connectingLine}></div>
            <div className={styles.dotLine}>
              {data.stages.map((stage: any, index: number) => (
                <div key={index} className={styles.dotStage}>
                  <div className={styles.dot}></div>
                  <span className={styles.stageLetter}>{stage.location}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className={styles.aiScoreRow}>
        <span className={styles.aiScore}>AI Score: {data.score}%</span>
      </div>

      <div className={styles.statusUpdateRow}>
        <div className={styles.statusLeft}>
          <span className={styles.onGoing}>{data.journeyStatus}</span>
          <span className={styles.lastUpdated}>Last Updated : {data.updated}</span>
        </div>
        <div className={styles.statusRight}>
          <span className={styles.statusText}>{data.status}</span>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.currentCondition}>
          <span className={styles.currentConditionLabel}>Current Condition:</span>
          <span className={styles.currentConditionValue}>
            {data.currentCondition || "Unknown"}
          </span>
          <button className={styles.detailButton} onClick={(e) => { e.stopPropagation(); handleDetailClick(e); }}>
            Detail
          </button>
        </div>
      )}
    </div>
  );
}