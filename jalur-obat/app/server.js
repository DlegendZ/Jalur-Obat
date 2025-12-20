import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { query } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


app.get("/", (req, res) => {
  res.send("API is running");
});

app.post("/update_journey", async (req, res) => {
  try {
    const {
      officer_id,
      serial_number,
      medicine_name,
      current_location,
      quantity,
      additional,
      temperature,
      humidity,
      overall_status,
      expedition_type,
      journey_status
    } = req.body;

    const quan = Number(quantity);
    const temp = parseFloat(temperature);
    const humid = parseFloat(humidity);

    if (
      !officer_id ||
      !serial_number ||
      !medicine_name ||
      !current_location ||
      !quan ||
      !temp ||
      !humid ||
      !overall_status ||
      !expedition_type ||
      !journey_status
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const currentPoint = {
      medicine_name,
      pos_code: current_location,
      condition: overall_status,
      temperature,
      humidity,
      timestamp: formatNow()
    };

    const routeData = await query(
      `SELECT
        medicine_name,
        current_location AS pos_code,
        overall_status AS condition,
        temperature,
        humidity,
        to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS timestamp
      FROM medicine_info
      WHERE serial_number = $1
      ORDER BY created_at`,
      [serial_number]
    );

    const history = routeData.rows;

    const route = [...history, currentPoint];

    const payload = { route };

    const aiRes = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!aiRes.ok) {
      console.error("AI error:", await aiRes.text());
    }

    const aiData = await aiRes.json();
    const score_fake = aiData.risk_score;
    const ai_journey_score = getStatus(score_fake);

    const result = await query(
      `INSERT INTO medicine_info (
        officer_id,
        serial_number,
        medicine_name,
        current_location,
        quantity,
        additional,
        temperature,
        humidity,
        overall_status,
        expedition_type,
        journey_status,
        ai_score_fake_result,
        ai_journey_score
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        officer_id,
        serial_number,
        medicine_name,
        current_location,
        quan,
        additional,
        temp,
        humid,
        overall_status,
        expedition_type,
        journey_status,
        score_fake,
        ai_journey_score
      ]
    );
    res.status(201).json(result.rows[0]);
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

function formatNow() {
  const now = new Date();

  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = now.getFullYear();
  const mm = pad(now.getMonth() + 1);
  const dd = pad(now.getDate());
  const hh = pad(now.getHours());
  const mi = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function getStatus(score_fake) {
  if ((100 - score_fake) >= 75) return "Safe";
  if ((100 - score_fake) >= 50) return "Need Attention";
  if ((100 - score_fake) >= 25) return "Full Attention";
  if ((100 - score_fake) > 0) return "Faked";
  return "Unknown";
}

app.get("/list_journey", async (req, res) => {
  try {
    const serials = await query(
      `SELECT DISTINCT serial_number FROM medicine_info`
    );

    const results_history = [];
    const results_latest = [];

    for (const row of serials.rows) {
      const serial = row.serial_number;

      const route_history = await query(
        `SELECT
          report_id,
          medicine_name,
          current_location AS pos_code,
          quantity,
          overall_status,
          temperature,
          humidity,
          additional,
          ai_score_fake_result,
          ai_journey_score,
          expedition_type,
          journey_status,
          to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS timestamp,
          officer_id
        FROM medicine_info
        WHERE serial_number = $1
        ORDER BY created_at`,
        [serial] //INI PAKE KALAU BUTUH HISTORY PERJALAN DATA
      );

      const route_latest = await query(
        `SELECT
          report_id,
          medicine_name,
          current_location AS pos_code,
          quantity,
          overall_status,
          temperature,
          humidity,
          additional,
          ai_score_fake_result,
          ai_journey_score,
          expedition_type,
          journey_status,
          to_char(created_at, 'YYYY-MM-DD HH24:MI:SS') AS timestamp,
          officer_id
        FROM medicine_info
        WHERE serial_number = $1
        ORDER BY created_at
        LIMIT 1`,
        [serial] //INI PAKE KALAU BUTUH LATEST DATA 
      );

      const history = route_history.rows;
      const latest = route_latest.rows;

      results_history.push({
        [serial]: history
      });

      results_latest.push({
        [serial]: latest
      });
    }

    res.status(200).json({ results_history });
    // res.status(200).json({results_latest}); BUTUH YANG MANA TINGGAL DI COMMEN/UNCOMMEN
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
