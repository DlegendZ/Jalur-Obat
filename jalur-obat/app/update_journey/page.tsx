// app/journey-update/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import "./journey-update.css";

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
    overallStatus: "Prima",
    expeditionType: "Darat",
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [aiDetection, setAiDetection] = useState<string>("Safe"); // mock
  const fileRef = useRef<HTMLInputElement | null>(null);
  const fileRefState = useRef<File | null>(null);
  const [loading, setLoading] = useState(false);

  function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function triggerFile() {
    fileRef.current?.click();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    fileRefState.current = f;
    setPreview(URL.createObjectURL(f));
    // contoh: setAiDetection berdasarkan file (mock)
    setAiDetection("Safe");
  }

  async function handleAction(action: "start" | "update" | "end") {
    setLoading(true);
    try {
      // Kita kirim semua sebagai FormData supaya foto + field dikirim sekaligus
      const fd = new FormData();
      fd.append("action", action);
      Object.entries(form).forEach(([k, v]: any) => fd.append(k, v ?? ""));
      if (fileRefState.current) fd.append("photo", fileRefState.current);

      const res = await fetch("/api/journey", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "API Error");

      // behaviour: kalau END -> ke Journey List
      if (action === "end") router.push("/journey-list");
      else alert(`${action.toUpperCase()} success!`);
    } catch (err: any) {
      alert("Gagal: " + (err?.message ?? "Unknown"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-root">
      <div className="mobile-frame">
        {/* header (logo kanan atas) */}
        <div className="journey-header">
          <div />
          <div className="journey-header-logo">
            <Image src="/app_logo.png" alt="logo" width={40} height={40} />
          </div>
        </div>

        <div className="journey-content">
          <h1 className="page-title">Journey Update</h1>

          <label className="label">OfficerID (Read Only)</label>
          <input name="officerId" value={form.officerId} onChange={onChange} className="text-input" />

          <label className="label">Serial Number*</label>
          <input name="serialNumber" value={form.serialNumber} onChange={onChange} className="text-input" />

          <label className="label">Medicine Name*</label>
          <input name="medicineName" value={form.medicineName} onChange={onChange} className="text-input" />

          <label className="label">Current Location*</label>
          <input name="currentLocation" value={form.currentLocation} onChange={onChange} className="text-input" />

          <label className="label">Quantity*</label>
          <input name="quantity" value={form.quantity} onChange={onChange} className="text-input" />

          <label className="label">Additional</label>
          <input name="additional" value={form.additional} onChange={onChange} className="text-input" />

          <label className="label">Temperature</label>
          <input name="temperature" value={form.temperature} onChange={onChange} className="text-input" />

          <label className="label">Overall Status*</label>
          <select name="overallStatus" value={form.overallStatus} onChange={onChange} className="text-input">
            <option>Prima</option>
            <option>Baik</option>
            <option>Menurun</option>
            <option>Rusak</option>
            <option>Kemasan Aneh</option>
            <option>Suhu Tinggi</option>
          </select>

          <label className="label">Expedition Type</label>
          <select name="expeditionType" value={form.expeditionType} onChange={onChange} className="text-input">
            <option>Darat</option>
            <option>Udara</option>
            <option>Laut</option>
          </select>

          <label className="label">Upload Photo*</label>

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
              <span className="ai-label">AI Detection :</span>
              <span className="ai-safe">{aiDetection}</span>
            </div>
          </div>

          {preview && <img src={preview} alt="preview" className="preview-img" />}

          <label className="checkbox-wrap">
            <input type="checkbox" className="hidden-checkbox" />
            <span className="fake-checkbox"></span>
            <span className="checkbox-text">I’m responsible for this data*</span>
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={() => handleAction("start")} className="action-button start" disabled={loading}>
              <img src="/start.png" className="btn-icon" />
            </button>
            <button type="button" onClick={() => handleAction("update")} className="action-button update" disabled={loading}>
              <img src="/update.png" className="btn-icon" />
            </button>
            <button type="button" onClick={() => handleAction("end")} className="action-button end" disabled={loading}>
              <img src="/end.png" className="btn-icon" />
            </button>
          </div>

          <nav className="bottom-nav">
            <Link href="/journey-list" className="nav-item"><img src="/journey-list.png" /><span>Journey List</span></Link>
          </nav>
        </div>

        <Link href="/" className="back-button">Back</Link>
      </div>
    </main>
  );
}