"use client";

import React from "react";
import { StockoutFormData } from "./stockout-prediction-form";

interface StockoutResult {
  predicted_days_to_stockout: number;
  urgency: string;
  note?: string;
}

interface Props {
  results: { prediction: StockoutResult; formData: StockoutFormData } | null;
  error: string | null;
  onReset: () => void;
  loading: boolean;
}

function urgencyColors(urgency: string) {
  if (urgency.includes("CRITICAL")) {
    return { bg: "from-red-500/10 to-red-500/5", border: "border-red-200", title: "text-red-700", badge: "bg-red-100 text-red-700 border-red-200" };
  }
  if (urgency.includes("HIGH")) {
    return { bg: "from-orange-100 to-orange-50", border: "border-orange-200", title: "text-orange-700", badge: "bg-orange-100 text-orange-700 border-orange-200" };
  }
  if (urgency.includes("MODERATE")) {
    return { bg: "from-yellow-100 to-yellow-50", border: "border-yellow-200", title: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700 border-yellow-200" };
  }
  return { bg: "from-green-500/10 to-green-500/5", border: "border-green-200", title: "text-green-700", badge: "bg-green-100 text-green-700 border-green-200" };
}

function urgencyLabel(urgency: string) {
  if (urgency.includes("CRITICAL")) return "CRITICAL";
  if (urgency.includes("HIGH")) return "HIGH";
  if (urgency.includes("MODERATE")) return "MODERATE";
  return "LOW";
}

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function StockoutPredictionResults({ results, error, onReset, loading }: Props) {
  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 h-fit">
        <h3 className="font-semibold text-destructive mb-2">Error</h3>
        <p className="text-sm text-destructive/90">{error}</p>
        <button
          onClick={onReset}
          className="mt-4 px-4 py-2 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition font-semibold text-sm"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 h-fit sticky top-24 flex flex-col items-center justify-center min-h-96">
        <div className="w-12 h-12 rounded-full border-4 border-border border-t-primary animate-spin mb-4"></div>
        <p className="text-muted-foreground font-semibold">Querying stockout model...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 h-fit sticky top-24 flex flex-col items-center justify-center min-h-96">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <p className="text-muted-foreground text-center px-4">Fill in the inventory details and click "Predict Stockout" to see when the medication will run out.</p>
      </div>
    );
  }

  const { prediction, formData } = results;
  const days = prediction.predicted_days_to_stockout;
  const colors = urgencyColors(prediction.urgency);
  const label = urgencyLabel(prediction.urgency);

  const progressPct = Math.min((days / 180) * 100, 100);

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-br ${colors.bg} ${colors.border} border rounded-xl p-8`}>
        <div className="text-center mb-6">
          <div className="text-5xl font-extrabold text-foreground mb-1">{days}</div>
          <p className="text-sm text-muted-foreground mb-3">days until stockout</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${colors.badge}`}>
            {label}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>0 days</span>
            <span>180 days</span>
          </div>
          <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                label === "CRITICAL" ? "bg-red-500" :
                label === "HIGH" ? "bg-orange-500" :
                label === "MODERATE" ? "bg-yellow-500" : "bg-green-500"
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Urgency message */}
        <div className={`p-3 rounded-lg border ${colors.badge} mb-4 text-sm font-medium text-center`}>
          {prediction.urgency.replace(/^[^\s]+\s/, "")}
        </div>

        {/* Note if present */}
        {prediction.note && (
          <div className="p-3 rounded-lg bg-white/60 border border-yellow-200 text-sm text-yellow-800 mb-4">
            {prediction.note}
          </div>
        )}

        {/* Thresholds legend */}
        <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
          {[
            { color: "bg-red-500", label: "CRITICAL", range: "≤ 20 days" },
            { color: "bg-orange-500", label: "HIGH", range: "≤ 45 days" },
            { color: "bg-yellow-500", label: "MODERATE", range: "≤ 90 days" },
            { color: "bg-green-500", label: "LOW", range: "> 90 days" },
          ].map(({ color, label: l, range }) => (
            <div key={l} className="flex items-center gap-2 bg-white/40 rounded-lg px-2 py-1">
              <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
              <span className="font-semibold">{l}</span>
              <span className="text-muted-foreground ml-auto">{range}</span>
            </div>
          ))}
        </div>

        {/* Input summary */}
        <div className="p-4 bg-white/50 rounded-lg">
          <h4 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">Inventory Snapshot</h4>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: "Medication", value: formData.medication_name },
              { label: "Pharmacy", value: formData.pharmacy_type },
              { label: "Stock Quantity", value: `${formData.stock_quantity} units` },
              { label: "Days to Expiry", value: `${formData.days_to_expiry} days` },
              { label: "Lead Time", value: `${formData.lead_time_days} days` },
              { label: "Prescription Qty", value: formData.prescription_quantity },
              { label: "Frequency", value: `${formData.frequency}×/month` },
              { label: "Promotion", value: formData.promotion_active ? "Active" : "Inactive" },
              { label: "Snapshot", value: `${MONTH_NAMES[formData.snapshot_month - 1]}, ${DAY_NAMES[formData.snapshot_dayofweek]}` },
            ].map(({ label: l, value }) => (
              <div key={l} className="flex justify-between">
                <span className="text-sm text-muted-foreground">{l}</span>
                <span className="text-sm font-semibold">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onReset}
          className="w-full mt-4 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition font-semibold"
        >
          New Prediction
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="font-bold text-foreground mb-2 text-lg">Disclaimer</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This model predicts stockout within a 180-day observation window. Predictions are estimates based on historical patterns and should be used alongside real-time inventory tracking and clinical judgment.
        </p>
      </div>
    </div>
  );
}
