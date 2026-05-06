'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

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
  baseline: {
    age: 65,
    sex: 1,
    education: 12,
    mmse: 25,
    moca: 26,
    adas_cog: 20,
    cdr_sb: 2,
    memory_recall: 20,
    adl: 85,
    iadl: 6,
  },
  high_risk: {
    age: 75,
    sex: 1,
    education: 10,
    mmse: 18,
    moca: 15,
    adas_cog: 45,
    cdr_sb: 8,
    memory_recall: 5,
    adl: 60,
    iadl: 3,
  },
  low_risk: {
    age: 60,
    sex: 0,
    education: 16,
    mmse: 29,
    moca: 28,
    adas_cog: 10,
    cdr_sb: 0,
    memory_recall: 28,
    adl: 95,
    iadl: 8,
  },
};

interface MciAssessmentFormProps {
  onSubmit: (data: MciFormData) => void;
  loading: boolean;
}

export default function MciAssessmentForm({ onSubmit, loading }: MciAssessmentFormProps) {
  const [formData, setFormData] = useState<MciFormData>(scenarios.baseline);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue = parseFloat(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue
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
      <h2 className="text-2xl font-bold text-foreground mb-6">MCI Patient Assessment</h2>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {Object.entries(scenarios).map(([key, _]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleScenario(key as keyof typeof scenarios)}
            className="py-2 px-3 rounded-lg font-semibold text-sm transition-all bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
          >
            {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Age</label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border bg-background"
              min="50" max="90"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sex (0=F, 1=M)</label>
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Education (years)</label>
            <input
              type="number"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border bg-background"
              min="0" max="22"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">MMSE Score (0-30)</label>
            <input
              type="number"
              name="mmse"
              value={formData.mmse}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border bg-background"
              min="0" max="30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">MoCA Score (0-30)</label>
            <input
              type="number"
              name="moca"
              value={formData.moca}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border bg-background"
              min="0" max="30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ADAS-Cog Score</label>
            <input
              type="number"
              name="adas_cog"
              value={formData.adas_cog}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border bg-background"
              min="0" max="70"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">CDR-SB (0-18)</label>
            <input
              type="number"
              name="cdr_sb"
              value={formData.cdr_sb}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border bg-background"
              min="0" max="18"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Memory Recall</label>
            <input
              type="number"
              name="memory_recall"
              value={formData.memory_recall}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border bg-background"
              min="0" max="30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">ADL Score</label>
            <input
              type="number"
              name="adl"
              value={formData.adl}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border bg-background"
              min="0" max="100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">IADL Score</label>
            <input
              type="number"
              name="iadl"
              value={formData.iadl}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border bg-background"
              min="0" max="8"
            />
          </div>
        </div>

        <Button type="submit" className="w-full mt-6" disabled={loading}>
          {loading ? 'Analyzing...' : 'Predict MCI Risk'}
        </Button>
      </form>
    </div>
  );
}
