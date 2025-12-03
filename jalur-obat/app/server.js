// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { query } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());    
app.use(express.json());  

// test route
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
            !humid||
            !overall_status ||
            !expedition_type
        ) {
        return res.status(400).json({ message: "Missing required fields" });
        }

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
            expedition_type
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
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
        ]
        );

        res.status(201).json(result.rows[0]);
    } 
  
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
