"use client";

import React from "react";

interface MciResultsDisplayProps {
  results: any;
  error: string | null;
  onReset: () => void;
  loading: boolean;
}

export default function MciResultsDisplay({
  results,
  error,
  onReset,
  loading,
}: MciResultsDisplayProps) {
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
        <p className="text-muted-foreground font-semibold">
          Analyzing MCI Risk...
        </p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 h-fit sticky top-24 flex flex-col items-center justify-center min-h-96">
        <p className="text-muted-foreground text-center px-4">
          Fill in the patient assessment and click &quot;Predict MCI Risk&quot;
          to see AI analysis
        </p>
      </div>
    );
  }

  const prediction = results.prediction;
  const isHighRisk = prediction == "Alzheimer Risk";

  const colorClass = isHighRisk
    ? "from-red-500/10 to-red-500/5 border-red-200"
    : "from-green-500/10 to-green-500/5 border-green-200";

  const titleColorClass = isHighRisk ? "text-red-700" : "text-green-700";

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-br ${colorClass} border rounded-xl p-8`}>
        <div className="text-center mb-6">
          <h3 className={`text-2xl font-bold ${titleColorClass} mb-2`}>
            {prediction}
          </h3>
          <p className="text-sm text-muted-foreground">
            MCI Conversion Prediction Result
          </p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-white/50 rounded-lg">
            <h4 className="font-semibold text-foreground mb-1 text-sm uppercase tracking-wider">
              Analysis
            </h4>
            <p className="text-foreground leading-relaxed">
              Based on the provided MMSE, MoCA, and ADAS-Cog scores, the model
              has identified
              <strong> {isHighRisk ? "High" : "No"} Risk</strong> of MCI
              conversion.
            </p>
          </div>

          <button
            onClick={onReset}
            className="w-full py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition font-semibold"
          >
            New Assessment
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="font-bold text-foreground mb-3 text-lg">Disclaimer</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This AI model is a decision-support tool and should not replace
          professional clinical judgment. Results should be interpreted within
          the full clinical context by a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
}
