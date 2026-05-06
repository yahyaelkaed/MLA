"use client";

import React from "react";

export default function MciModelPerformance() {
  const metrics = [
    { label: "Model", value: "SVM", id: "model" },
    { label: "Accuracy", value: "74.59%", id: "accuracy" },
    { label: "Precision", value: "71.52%", id: "precision" },
    { label: "ROC AUC", value: "82.30%", id: "roc_auc" },
    { label: "F1", value: "73.38%", id: "f1" },
    { label: "Recall", value: "75.34%", id: "recall" },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-card border border-border rounded-xl p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Model Performance
        </h2>

        <div className="grid grid-cols-6 gap-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-lg p-6 text-center hover:border-primary/40 transition-colors"
            >
              <p className="text-sm font-medium text-muted-foreground mb-2">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-foreground">
                {metric.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
