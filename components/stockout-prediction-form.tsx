"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

const PHARMACY_TYPES = ["Clinic", "Hospital", "Retail"] as const;

const MEDICATIONS = [
  "Amoxicillin 500mg",
  "Atorvastatin 20mg",
  "Ibuprofen 400mg",
  "Insulin Glargine",
  "Levothyroxine 50mcg",
  "Metformin 850mg",
  "Omeprazole 20mg",
  "Paracetamol 500mg",
] as const;

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface StockoutFormData {
  lead_time_days: number;
  promotion_active: number;
  days_to_expiry: number;
  stock_quantity: number;
  prescription_quantity: number;
  frequency: number;
  snapshot_month: number;
  snapshot_dayofweek: number;
  pharmacy_type: string;
  medication_name: string;
}

const scenarios: Record<string, StockoutFormData> = {
  healthy: {
    lead_time_days: 5,
    promotion_active: 0,
    days_to_expiry: 400,
    stock_quantity: 1500,
    prescription_quantity: 20,
    frequency: 2,
    snapshot_month: 6,
    snapshot_dayofweek: 2,
    pharmacy_type: "Retail",
    medication_name: "Ibuprofen 400mg",
  },
  typical: {
    lead_time_days: 8,
    promotion_active: 0,
    days_to_expiry: 242,
    stock_quantity: 348,
    prescription_quantity: 38,
    frequency: 4,
    snapshot_month: 7,
    snapshot_dayofweek: 3,
    pharmacy_type: "Clinic",
    medication_name: "Paracetamol 500mg",
  },
  critical: {
    lead_time_days: 15,
    promotion_active: 1,
    days_to_expiry: 30,
    stock_quantity: 50,
    prescription_quantity: 80,
    frequency: 8,
    snapshot_month: 1,
    snapshot_dayofweek: 1,
    pharmacy_type: "Hospital",
    medication_name: "Insulin Glargine",
  },
};

interface Props {
  onSubmit: (data: StockoutFormData) => void;
  loading: boolean;
}

export default function StockoutPredictionForm({ onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<StockoutFormData>(scenarios.typical);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "pharmacy_type" || name === "medication_name") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      const parsed = parseFloat(value);
      setFormData((prev) => ({ ...prev, [name]: Number.isFinite(parsed) ? parsed : 0 }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-8 h-fit sticky top-24">
      <h2 className="text-2xl font-bold text-foreground mb-2">Stockout Assessment</h2>
      <p className="text-sm text-muted-foreground mb-6">Predicts days before a medication runs out (0–180 day window)</p>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {Object.keys(scenarios).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFormData(scenarios[key])}
            className="py-2 px-3 rounded-lg font-semibold text-sm transition-all bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Lead Time */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-muted-foreground">Lead Time (days)</label>
            <span className="text-sm font-bold text-primary">{formData.lead_time_days}</span>
          </div>
          <input
            type="range"
            name="lead_time_days"
            value={formData.lead_time_days}
            onChange={handleChange}
            min={0} max={60} step={1}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Promotion Active */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Promotion Active</label>
          <div className="flex gap-3">
            {[{ val: 0, label: "No" }, { val: 1, label: "Yes" }].map(({ val, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, promotion_active: val }))}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  formData.promotion_active === val
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Days to Expiry */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-muted-foreground">Days to Expiry</label>
            <span className="text-sm font-bold text-primary">{formData.days_to_expiry}</span>
          </div>
          <input
            type="range"
            name="days_to_expiry"
            value={formData.days_to_expiry}
            onChange={handleChange}
            min={0} max={730} step={1}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Stock Quantity */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-muted-foreground">Stock Quantity (units)</label>
            <span className="text-sm font-bold text-primary">{formData.stock_quantity}</span>
          </div>
          <input
            type="range"
            name="stock_quantity"
            value={formData.stock_quantity}
            onChange={handleChange}
            min={0} max={2000} step={10}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Prescription Quantity */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Prescription Quantity</label>
          <input
            type="number"
            name="prescription_quantity"
            value={formData.prescription_quantity}
            onChange={handleChange}
            min={0} max={100}
            className="w-full p-2 rounded-lg border bg-background text-sm"
          />
        </div>

        {/* Frequency */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-muted-foreground">Frequency (times/month)</label>
            <span className="text-sm font-bold text-primary">{formData.frequency}</span>
          </div>
          <input
            type="range"
            name="frequency"
            value={formData.frequency}
            onChange={handleChange}
            min={0} max={30} step={1}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Snapshot Month */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-muted-foreground">Snapshot Month</label>
            <span className="text-sm font-bold text-primary">{MONTH_NAMES[formData.snapshot_month - 1]}</span>
          </div>
          <input
            type="range"
            name="snapshot_month"
            value={formData.snapshot_month}
            onChange={handleChange}
            min={1} max={12} step={1}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Snapshot Day of Week */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-muted-foreground">Snapshot Day of Week</label>
            <span className="text-sm font-bold text-primary">{DAY_NAMES[formData.snapshot_dayofweek]}</span>
          </div>
          <input
            type="range"
            name="snapshot_dayofweek"
            value={formData.snapshot_dayofweek}
            onChange={handleChange}
            min={0} max={6} step={1}
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Pharmacy Type */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Pharmacy Type</label>
          <select
            name="pharmacy_type"
            value={formData.pharmacy_type}
            onChange={handleChange}
            className="w-full p-2 rounded-lg border bg-background text-sm"
          >
            {PHARMACY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Medication Name */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Medication Name</label>
          <select
            name="medication_name"
            value={formData.medication_name}
            onChange={handleChange}
            className="w-full p-2 rounded-lg border bg-background text-sm"
          >
            {MEDICATIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "Predicting..." : "Predict Stockout"}
        </Button>
      </form>
    </div>
  );
}
