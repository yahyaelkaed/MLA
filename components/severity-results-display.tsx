"use client";

import React from "react";

interface SeverityResultsDisplayProps {
  results: any;
  error: string | null;
  onReset: () => void;
  loading: boolean;
}

export default function SeverityResultsDisplay({
  results,
  error,
  onReset,
  loading,
}: SeverityResultsDisplayProps) {
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
        <p className="text-muted-foreground font-semibold">Predicting future severity...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 h-fit sticky top-24 flex flex-col items-center justify-center min-h-96">
        <p className="text-muted-foreground text-center px-4">Fill in the patient features and click "Predict Future Severity" to see model output.</p>
      </div>
    );
  }

  const raw = String(results.predicted || "");

  const translate = (s: string) => {
    const t = s.trim().toLowerCase();
    if (t === "aucune" || t === "none" || t.includes("unchanged")) return "Severity Unchanged";
    if (t === "sévère" || t === "sévére" || t === "severe") return "Severe";
    if (t === "modérée" || t === "modere" || t === "moderate") return "Moderate";
    if (t === "légère" || t === "legere" || t === "mild") return "Mild";
    // fallback: if numeric
    if (/^[0-3]$/.test(t)) {
      switch (Number(t)) {
        case 1:
          return "Mild";
        case 2:
          return "Moderate";
        case 3:
          return "Severe";
        default:
          return "None";
      }
    }
    // default: capitalize
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const predictedLabel = translate(raw);

  const colorFor = (label: string) => {
    switch (label) {
      case "Mild":
        return { from: "from-yellow-100", to: "to-yellow-50", border: "border-yellow-200", title: "text-yellow-700" };
      case "Moderate":
        return { from: "from-orange-100", to: "to-orange-50", border: "border-orange-200", title: "text-orange-700" };
      case "Severe":
        return { from: "from-red-500/10", to: "to-red-500/5", border: "border-red-200", title: "text-red-700" };
      case "Severity Unchanged":
      case "None":
      default:
        return { from: "from-green-500/10", to: "to-green-500/5", border: "border-green-200", title: "text-green-700" };
    }
  };

  const colors = colorFor(predictedLabel);

  const form = results.formData || {};

  const medName = (v: number) => {
    switch (Number(v)) {
      case 1:
        return "Donepezil";
      case 2:
        return "Memantine";
      default:
        return "None";
    }
  };

  const currentSeverityLabel = (v: any) => {
    const n = Number(v);
    switch (n) {
      case 1:
        return "Mild";
      case 2:
        return "Moderate";
      case 3:
        return "Severe";
      default:
        return "None";
    }
  };

  const currentLabel = currentSeverityLabel(form.severity);
  const currentColors = colorFor(currentLabel);

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-br ${colors.from} ${colors.to} ${colors.border} border rounded-xl p-8`}>
        <div className="text-center mb-6">
          <h3 className={`text-2xl font-bold ${colors.title} mb-2`}>{predictedLabel}</h3>
          <p className="text-sm text-muted-foreground">Predicted Future Severity</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white/50 rounded-lg">
            <h4 className="font-semibold text-foreground mb-1 text-sm uppercase tracking-wider">Patient Summary</h4>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Severity</span>
                <span className={`font-semibold ${currentColors.title}`}>{currentLabel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Age</span>
                <span className="font-semibold">{form.age ?? "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Gender</span>
                <span className="font-semibold">{form.gender === 1 ? "Male" : "Female"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Previous Medication</span>
                <span className="font-semibold">{medName(form.previous_medication)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Prescribed Medication</span>
                <span className="font-semibold">{medName(form.prescribed_medication)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition font-semibold"
          >
            New Prediction
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="font-bold text-foreground mb-3 text-lg">Disclaimer</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">This AI model is a decision-support tool and should not replace professional clinical judgment. Results should be interpreted within the full clinical context by a qualified healthcare professional.</p>
      </div>
    </div>
  );
}
