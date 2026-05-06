"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface SeverityFormData {
  age: number;
  gender: number; // 0 or 1
  severity: number;
  test_last: number;
  test_mean: number;
  test_trend: number;
  previous_medication: number;
  prescribed_medication: number;
}

const scenarios = {
  typical: {
    age: 72,
    gender: 0,
    severity: 0,
    test_last: 70,
    test_mean: 50,
    test_trend: 0,
    previous_medication: 0,
    prescribed_medication: 0,
  },
  medium: {
    age: 90,
    gender: 1,
    severity: 1,
    test_last: 90,
    test_mean: 90,
    test_trend: -1.8,
    previous_medication: 2,
    prescribed_medication: 1,
  },
  severe: {
    age: 85,
    gender: 1,
    severity: 3,
    test_last: 70,
    test_mean: 75,
    test_trend: 0.6,
    previous_medication: 2,
    prescribed_medication: 2,
  },
};

interface SeverityAssessmentFormProps {
  onSubmit: (data: SeverityFormData) => void;
  loading: boolean;
}

export default function SeverityAssessmentForm({
  onSubmit,
  loading,
}: SeverityAssessmentFormProps) {
  const [formData, setFormData] = useState<SeverityFormData>(scenarios.typical);

  const medName = (v: number) => {
    switch (v) {
      case 1:
        return "Donepezil";
      case 2:
        return "Memantine";
      default:
        return "None";
    }
  };

  const severityLabel = (v: number) => {
    switch (v) {
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // parse safely and avoid NaN
    const parseSafe = (val: string, fallback = 0) => {
      const p = parseFloat(val as string);
      return Number.isFinite(p) ? p : fallback;
    };

    let v: any;

    if (name === "gender") {
      v = Number(value);
      if (!Number.isFinite(v)) v = 0;
    } else if (name === "severity") {
      v = Number(value);
      if (!Number.isFinite(v)) v = 0;
    } else if (name === "test_trend") {
      const p = parseSafe(value, 0);
      v = Number(p.toFixed(3));
    } else {
      v = parseSafe(value, 0);
    }

    // clamp sensible ranges based on dataset
    if (name === "age") v = Math.min(100, Math.max(40, Number(v)));
    if (name === "test_last" || name === "test_mean") v = Math.min(100, Math.max(0, Number(v)));
    if (name === "test_trend") v = Math.min(2, Math.max(-2, Number(v)));
    if (name === "previous_medication" || name === "prescribed_medication") v = Math.min(2, Math.max(0, Number(v)));

    setFormData((prev) => ({
      ...prev,
      [name]: v,
    }));
  };

  const handleScenario = (key: keyof typeof scenarios) => {
    setFormData(scenarios[key]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-8 h-fit sticky top-24">
      <h2 className="text-2xl font-bold text-foreground mb-6">Severity Prediction</h2>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {Object.entries(scenarios).map(([key]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleScenario(key as keyof typeof scenarios)}
            className="py-2 px-3 rounded-lg font-semibold text-sm transition-all bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">Age</label>
            <span className="text-sm font-bold text-primary">{formData.age}</span>
          </div>
          <input
            type="range"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="40"
            max="100"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Gender</label>
          <select name="gender" value={String(formData.gender)} onChange={handleChange} className="w-full p-2 rounded-lg border bg-background">
            <option value={"0"}>Female</option>
            <option value={"1"}>Male</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">Current Severity</label>
            <span className="text-sm font-bold text-primary">{severityLabel(formData.severity)}</span>
          </div>
          <input
            type="range"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            min="0"
            max="3"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Last Test Score</label>
          <input type="number" name="test_last" value={formData.test_last} onChange={handleChange} className="w-full p-2 rounded-lg border bg-background" min={0} max={100} />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Mean Test Score</label>
          <input type="number" name="test_mean" value={formData.test_mean} onChange={handleChange} className="w-full p-2 rounded-lg border bg-background" min={0} max={100} />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Test Trend (-2 to 2)</label>
          <input type="number" name="test_trend" value={formData.test_trend} onChange={handleChange} className="w-full p-2 rounded-lg border bg-background" min={-2} max={2} step={0.01} />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">Previous Medication</label>
            <span className="text-sm font-bold text-primary">{medName(formData.previous_medication)}</span>
          </div>
          <input type="range" name="previous_medication" value={formData.previous_medication} onChange={handleChange} min={0} max={2} step={1} className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">Prescribed Medication</label>
            <span className="text-sm font-bold text-primary">{medName(formData.prescribed_medication)}</span>
          </div>
          <input type="range" name="prescribed_medication" value={formData.prescribed_medication} onChange={handleChange} min={0} max={2} step={1} className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
        </div>

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          {loading ? "Predicting..." : "Predict Future Severity"}
        </Button>
      </form>
    </div>
  );
}
