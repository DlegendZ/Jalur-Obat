// app/journey_detail/[id]/page.tsx
import React from "react";
import styles from "./JourneyDetail.module.css";
import Link from "next/link";

type Stage = {
  location: string;
  time: string;
  officerName?: string;
  officerId?: string;
  quantity?: string;
  temperature?: string;
  humidity?: string;
  expeditionType?: string;
  additional?: string;
  imageUrl?: string;
};

type Journey = {
  id: string;
  name: string;
  stages: Stage[];
};

type Props = {
  params: Promise<{ id: string }> | { id: string };
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

async function getJourneyById(id: string): Promise<Journey> {
  const defaultJourney: Journey = { id, name: "Unknown Drug", stages: [] };

  try {
    // Fetch seluruh data journey dari API
    const res = await fetch(`${API_BASE}/list_journey`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      console.error(`HTTP error: ${res.status}`);
      return defaultJourney;
    }
    const json = await res.json();

    // Cari data yang sesuai dengan ID serial
    // Kita cari objek di array results_history di mana kuncinya (serial number) cocok dengan ID
    const matchingObj = (json.results_history || []).find((obj: any) => Object.keys(obj)[0] === id);

    if (!matchingObj) {
      console.warn(`Journey ID ${id} not found in API response.`);
      return defaultJourney;
    }

    const history = matchingObj[id] as any[];
    if (!history || history.length === 0) return defaultJourney;

    const latest = history[history.length - 1];

    // Transformasi data history ke format Stage[]
    const stages: Stage[] = history.map((h: any) => ({
      // Formatting timestamp dari YYYY-MM-DD HH:MM:SS ke HH:MM:SS DD/MM/YYYY
      time: h.timestamp
        ? `${h.timestamp.split(' ')[1]} ${h.timestamp.split(' ')[0].split('-').reverse().join('/')}`
        : "N/A",

      location: h.pos_code ?? h.current_location ?? "X",

      // Mengambil detail dari kolom database
      officerName: h.officer_name,
      officerId: h.officer_id,
      quantity: h.quantity ? String(h.quantity) : undefined,
      temperature: h.temperature ? `${h.temperature}°C` : undefined, // Asumsi kolom temp adalah angka
      humidity: h.humidity ? `${h.humidity}%` : undefined, // Asumsi kolom humidity adalah angka
      expeditionType: h.expedition_type,
      additional: h.additional_text,
    }));

    // Mengembalikan objek Journey yang valid
    return {
      id: id,
      name: latest.medicine_name || "Unknown Drug",
      stages: stages,
    };

  } catch (e) {
    console.error("Failed to fetch journey data:", e);
    return defaultJourney; // Selalu kembalikan default jika terjadi error
  }
}

export default async function JourneyDetail({ params }: Props) {
  const resolved = await params;
  const { id } = resolved;

  // fetch data berdasarkan id (ganti dengan fetch nyata kalau ada)
  const data = await getJourneyById(id);

  return (
    <div className={styles.root}>
      <div className={styles.phone}>

        <div className={styles.headerRow}>
          <Link href="/list_journey">
            <button className={styles.backBtn}><svg
              className="backIcon"
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#03254c"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 14l-4-4 4-4" />
              <path d="M5 10h10a4 4 0 1 1 0 8h-3" />
            </svg></button>
          </Link>
          <div>
            <h1 className={styles.title}>Journey Detail</h1>
            <h2 className={styles.subtitle}>{data.name} - {data.id}</h2>
          </div>
          <img src="/app_logo.png" className={styles.logo} alt="logo" />
        </div>

        {/* render semua stages */}
        {data.stages.map((stage, idx) => (
          <div key={idx} className={styles.card}>
            <div className={styles.row}>
              <div>Location : {stage.location}</div>
              <div className={styles.time}>{stage.time}</div>
            </div>

            <div className={styles.field}>Officer Name: {stage.officerName ?? "-"}</div>
            <div className={styles.field}>Officer ID: {stage.officerId ?? "-"}</div>
            <div className={styles.field}>Quantity: {stage.quantity ? `${stage.quantity} pcs` : "-"}</div>
            <div className={styles.field}>Temperature: {stage.temperature ?? "-"}</div>
            <div className={styles.field}>Humidity: {stage.humidity ?? "-"}</div>
            <div className={styles.field}>Expedition Type: {stage.expeditionType ?? "-"}</div>
            <div className={styles.field}>Additional: {stage.additional ?? "-"}</div>

          </div>
        ))}

        <img src="/app_logo.png" alt="logo" className={styles.logoBottom} />
      </div>
    </div>
  );
}
