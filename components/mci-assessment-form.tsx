"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";

interface MciFormData {
  age: number;
  sex: number;
  education: number;
  mmse: number;
  moca: number;
  adas_cog: number;
  cdr_sb: number;
  memory_recall: number;
  adl: number;
  iadl: number;
}

const scenarios = {
  no_risk: {
    age: 54,
    sex: 0,
    education: 9,
    mmse: 28,
    moca: 29,
    adas_cog: 1,
    cdr_sb: 1.5,
    memory_recall: 29,
    adl: 100,
    iadl: 8,
  },
  high_risk: {
    age: 82,
    sex: 1,
    education: 13,
    mmse: 22,
    moca: 22,
    adas_cog: 40,
    cdr_sb: 7,
    memory_recall: 16,
    adl: 69,
    iadl: 2,
  },
};

interface MciAssessmentFormProps {
  onSubmit: (data: MciFormData) => void;
  loading: boolean;
}

export default function MciAssessmentForm({
  onSubmit,
  loading,
}: MciAssessmentFormProps) {
  const [formData, setFormData] = useState<MciFormData>(scenarios.no_risk);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    let numValue = parseFloat(value);

    // Clamp values to model constraints (similar to AssessmentForm)
    if (name === "age") numValue = Math.min(90, Math.max(50, numValue));
    if (name === "sex") numValue = numValue >= 1 ? 1 : 0;
    if (name === "education") numValue = Math.min(22, Math.max(0, numValue));
    if (name === "mmse") numValue = Math.min(30, Math.max(0, numValue));
    if (name === "moca") numValue = Math.min(30, Math.max(0, numValue));
    if (name === "adas_cog") numValue = Math.min(70, Math.max(0, numValue));
    if (name === "cdr_sb") {
      numValue = Math.min(18, Math.max(0, numValue));
      numValue = Math.round(numValue * 2) / 2;
    }
    if (name === "memory_recall")
      numValue = Math.min(30, Math.max(0, numValue));
    if (name === "adl") numValue = Math.min(100, Math.max(0, numValue));
    if (name === "iadl") numValue = Math.min(8, Math.max(0, numValue));

    setFormData((prev) => ({
      ...prev,
      [name]: numValue,
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
      <h2 className="text-2xl font-bold text-foreground mb-6">
        MCI Patient Assessment
      </h2>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {Object.entries(scenarios).map(([key, _]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleScenario(key as keyof typeof scenarios)}
            className="py-2 px-3 rounded-lg font-semibold text-sm transition-all bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          >
            {key
              .split("_")
              .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
              .join(" ")}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              Age (50-90)
            </label>
            <span className="text-sm font-bold text-primary">
              {formData.age}
            </span>
          </div>
          <input
            type="range"
            name="age"
            value={formData.age}
            onChange={handleChange}
            min="50"
            max="90"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Gender
          </label>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            className="w-full p-2 rounded-lg border bg-background"
          >
            <option value={0}>Female (0)</option>
            <option value={1}>Male (1)</option>
          </select>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              Education Level (years) (0-22)
            </label>
            <span className="text-sm font-bold text-primary">
              {formData.education}
            </span>
          </div>
          <input
            type="range"
            name="education"
            value={formData.education}
            onChange={handleChange}
            min="0"
            max="22"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              MMSE Score (0-30)
            </label>
            <span className="text-sm font-bold text-primary">
              {formData.mmse}
            </span>
          </div>
          <input
            type="range"
            name="mmse"
            value={formData.mmse}
            onChange={handleChange}
            min="0"
            max="30"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              MoCA Score (0-30)
            </label>
            <span className="text-sm font-bold text-primary">
              {formData.moca}
            </span>
          </div>
          <input
            type="range"
            name="moca"
            value={formData.moca}
            onChange={handleChange}
            min="0"
            max="30"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              ADAS-Cog Score (0-70)
            </label>
            <span className="text-sm font-bold text-primary">
              {formData.adas_cog}
            </span>
          </div>
          <input
            type="range"
            name="adas_cog"
            value={formData.adas_cog}
            onChange={handleChange}
            min="0"
            max="70"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              CDR-SB (0-18)
            </label>
            <span className="text-sm font-bold text-primary">
              {formData.cdr_sb}
            </span>
          </div>
          <input
            type="range"
            name="cdr_sb"
            value={formData.cdr_sb}
            onChange={handleChange}
            min="0"
            max="18"
            step="0.5"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              Memory Recall (0-30)
            </label>
            <span className="text-sm font-bold text-primary">
              {formData.memory_recall}
            </span>
          </div>
          <input
            type="range"
            name="memory_recall"
            value={formData.memory_recall}
            onChange={handleChange}
            min="0"
            max="30"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              ADL Score (0-100)
            </label>
            <span className="text-sm font-bold text-primary">
              {formData.adl}
            </span>
          </div>
          <input
            type="range"
            name="adl"
            value={formData.adl}
            onChange={handleChange}
            min="0"
            max="100"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              IADL Score (0-8)
            </label>
            <span className="text-sm font-bold text-primary">
              {formData.iadl}
            </span>
          </div>
          <input
            type="range"
            name="iadl"
            value={formData.iadl}
            onChange={handleChange}
            min="0"
            max="8"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          {loading ? "Analyzing..." : "Predict MCI Risk"}
        </Button>
      </form>
    </div>
  );
}
