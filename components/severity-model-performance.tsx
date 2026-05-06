"use client";

import React from "react";

export default function SeverityModelPerformance() {
  const metrics = [
    { label: "Model", value: "Random Forest", id: "model" },
    { label: "Accuracy", value: "95%", id: "accuracy" },
    { label: "F1-Score", value: "95%", id: "f1" },
    { label: "ROC AUC", value: "99%", id: "roc_auc" },
    { label: "RMSE", value: "0.47", id: "rmse" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Model Performance</h2>

        <div className="grid grid-cols-6 gap-4">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors">
              <p className="text-sm font-medium text-muted-foreground mb-2">{metric.label}</p>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
