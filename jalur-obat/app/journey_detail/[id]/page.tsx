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

// Contoh placeholder fetch function -> ganti dengan fetch/DB asli
async function getJourneyById(id: string): Promise<Journey> {
  // contoh mock data (3 lokasi)
  return {
    id,
    name: "OBH KOMIK",
    stages: [
      {
        location: "A",
        time: "13:23:12 22/1/2022",
        officerName: "Budi",
        officerId: "OFF-001",
        quantity: "1000",
        temperature: "25°C",
        humidity: "60%",
        expeditionType: "Truck",
        additional: "No issues",
        imageUrl: "/placeholder.png",
      },
      {
        location: "B",
        time: "14:10:00 22/1/2022",
        officerName: "Siti",
        officerId: "OFF-002",
        quantity: "980",
        temperature: "26°C",
        humidity: "58%",
        expeditionType: "Van",
        additional: "Delay 10min",
        imageUrl: "/placeholder.png",
      },
      {
        location: "D",
        time: "15:00:00 22/1/2022",
        officerName: "Andi",
        officerId: "OFF-003",
        quantity: "950",
        temperature: "24°C",
        humidity: "62%",
        expeditionType: "Bike",
        additional: "Checked seals",
        imageUrl: "/placeholder.png",
      },
    ],
  };
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

            <div className={styles.field}>Officer Name : {stage.officerName ?? "-"}</div>
            <div className={styles.field}>Officer ID : {stage.officerId ?? "-"}</div>
            <div className={styles.field}>Quantity : {stage.quantity ?? "-"}</div>
            <div className={styles.field}>Temperature : {stage.temperature ?? "-"}</div>
            <div className={styles.field}>Humidity : {stage.humidity ?? "-"}</div>
            <div className={styles.field}>Expedition Type : {stage.expeditionType ?? "-"}</div>
            <div className={styles.field}>Additional : {stage.additional ?? "-"}</div>

            <div className={styles.imagePlaceholder}>
              {stage.imageUrl ? <img src={stage.imageUrl} alt={`img-${stage.location}`} /> : "image"}
            </div>
          </div>
        ))}

        <img src="/app_logo.png" alt="logo" className={styles.logoBottom} />
      </div>
    </div>
  );
}