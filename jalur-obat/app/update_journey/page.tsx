"use client";

import Script from "next/script";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "../components/bottomNav";
import "./journey-update.css";
import JourneyCard from "../list_journey/journey-card";

export default function JourneyUpdatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    officerId: "",
    serialNumber: "",
    medicineName: "",
    currentLocation: "",
    quantity: "",
    additional: "",
    temperature: "",
    humidity: "",
    overallStatus: "Safe",
    expeditionType: "Land",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [aiDetection, setAiDetection] = useState<string>("(-)"); // mock
  const fileRef = useRef<HTMLInputElement | null>(null);
  const fileRefState = useRef<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [agree, setAgree] = useState(false);
  const [detecting, setDetecting] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function triggerFile() {
    fileRef.current?.click();
  }

  async function submitJourney(status:string) {
  const body = {
    officer_id: form.officerId,
    serial_number: form.serialNumber,
    medicine_name: form.medicineName,
    current_location: form.currentLocation,
    quantity: Number(form.quantity),
    additional: form.additional || null,
    temperature: Number(form.temperature),
    humidity: Number(form.humidity),
    overall_status: form.overallStatus,
    expedition_type: form.expeditionType,
    journey_status: status
  };

  try {
    const res = await fetch("http://localhost:5000/update_journey", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      alert("Error: Failed to save");
    } else {
      alert(`Saved! Journey ${status} recorded.`);
      setForm({
        officerId: "",
        serialNumber: "",
        medicineName: "",
        currentLocation: "",
        quantity: "",
        additional: "",
        temperature: "",
        humidity: "",
        overallStatus: "Safe",
        expeditionType: "Land",
      });
    }
  } catch (err) {
    console.error(err);
    alert("Network error");
  }
}
  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (f.size > MAX_SIZE) {
      alert("The file is too large. Maximum 5MB.");
      return;
    }

    if (preview) URL.revokeObjectURL(preview);

    fileRefState.current = f;
    const url = URL.createObjectURL(f);
    setPreview(url);

    setDetecting(true);
    setAiDetection("Detecting...");

    try {
      const fd = new FormData();
      fd.append("file", f);

      const res = await fetch("http://127.0.0.1:8000/analyze-image-file", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "AI detect failed");
      }

      const json = await res.json();
      setAiDetection(json.status ?? "Unknown");
    } catch (err: any) {
      console.error("AI detect error:", err);
      setAiDetection("Error");
    } finally {
      setDetecting(false);
    }
  }


  // async function handleAction(action: "start" | "update" | "end") {
  //   if (!agree) {
  //     alert("Please confirm that you are responsible for this data.");
  //     return;
  //   }

  //   const requiredFields: (keyof typeof form)[] = [
  //     "officerId",
  //     "serialNumber",
  //     "medicineName",
  //     "currentLocation",
  //     "quantity",
  //     "overallStatus",
  //     "expeditionType",
  //     "temperature",
  //     "humidity"
  //   ];

  //   for (const field of requiredFields) {
  //     if (!form[field] || form[field].trim() === "") {
  //       alert("Please fill in all required fields.");
  //       return;
  //     }
  //   }

  //   // 🔒 Cek foto wajib ada
  //   if (!fileRefState.current) {
  //     alert("Please upload a photo.");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     const fd = new FormData();
  //     fd.append("action", action);
  //     Object.entries(form).forEach(([k, v]: any) => fd.append(k, v ?? ""));
  //     if (fileRefState.current) fd.append("photo", fileRefState.current);

  //     const res = await fetch("/api/journey", {
  //       method: "POST",
  //       body: fd,
  //     });

  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data?.message || "API Error");

  //     if (action === "end") router.push("/journey-list");
  //     else alert(`${action.toUpperCase()} success!`);
  //   } catch (err: any) {
  //     alert("Failed: " + (err?.message ?? "Unknown"));
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  return (
    <div className="root">
      <div className="phone">

        <div className="headerRow">
          <h1 className="title">Journey Update</h1>
          <img src="/app_logo.png" className="logo" alt="logo" />
        </div>

        <div className="journey-content">
          <h6>(*) = Required</h6>

          <label className="label">OfficerID*</label>
          <input name="officerId" value={form.officerId} onChange={onChange} className="text-input" required />

          <label className="label">Serial Number*</label>
          <input name="serialNumber" value={form.serialNumber} onChange={onChange} className="text-input" required />

          <label className="label">Medicine Name*</label>
          <input name="medicineName" value={form.medicineName} onChange={onChange} className="text-input" required />

          <label className="label">Current Location*</label>
          <input name="currentLocation" value={form.currentLocation} onChange={onChange} className="text-input" required />

          <label className="label">Quantity*</label>
          <input name="quantity" value={form.quantity} onChange={onChange} className="text-input" required />

          <label className="label">Additional</label>
          <textarea name="additional" value={form.additional} onChange={onChange} className="text-input" rows={5} />

          <label className="label">Temperature*</label>
          <input name="temperature" value={form.temperature} onChange={onChange} className="text-input" required />

          <label className="label">Humidity*</label>
          <input name="humidity" value={form.humidity} onChange={onChange} className="text-input" required />

          <label className="label">Overall Status*</label>
          <select name="overallStatus" value={form.overallStatus} onChange={onChange} className="text-input" required>
            <option value="Safe">Safe</option>
            <option value= "Need Attention">Need Attention</option>
            <option value= "Bad">Bad</option>
          </select>

          <label className="label">Expedition Type*</label>
          <select name="expeditionType" value={form.expeditionType} onChange={onChange} className="text-input" required>
            <option>Land</option>
            <option>Air</option>
            <option>Sea</option>
          </select>

          <label className="label">Upload Photo</label>

          <div className="upload-wrapper">
  <button
    type="button"
    className="upload-button"
    onClick={() => fileRef.current?.click()}
  >
    Choose Photo
  </button>

  <input
    ref={fileRef}
    type="file"
    accept="image/*"
    onChange={onFile}
    className="hidden-file-input"
  />

  <div className="ai-detect-block">
    <span className="ai-label">AI Detection:</span>
    <span className={`ai-detect-text ${aiDetection.replace(/\s+/g, "-").toLowerCase()}`}>
      {aiDetection}
    </span>
  </div>
</div>


          {preview && <img src={preview} alt="preview" className="preview-img" />}

          <label className="checkbox-wrap">
            <input
              type="checkbox"
              className="hidden-checkbox"
              checked={agree}
              onChange={() => setAgree(!agree)}
            />
            <span className="fake-checkbox"></span>
            <span className="checkbox-text">I’m responsible for this data*</span>
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 15 }}>
            <button type="button" onClick={() => submitJourney("start")} className="action-button start" disabled={loading || !agree}>
              <img src="/start-journey.png" className="btn-icon" />
            </button>
            <button type="button" onClick={() => submitJourney("update")} className="action-button update" disabled={loading || !agree}>
              <img src="/update-journey.png" className="btn-icon" />
            </button>
            <button type="button" onClick={() => submitJourney("end")} className="action-button end" disabled={loading || !agree}>
              <img src="/end-journey.png" className="btn-icon" />
            </button>
          </div>
        </div>
        <BottomNav />
      </div>
    </div>
  ); 

}



