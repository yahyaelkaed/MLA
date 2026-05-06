'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface FormData {
  tasks_completed_last_week: number;
  patient_activity_level: number;
  num_alerts_last_week: number;
  cognitive_score: number;
  sleep_hours_avg: number;
}

const scenarios = {
  low: {
    tasks_completed_last_week: 5,
    patient_activity_level: 8,
    num_alerts_last_week: 2,
    cognitive_score: 80,
    sleep_hours_avg: 8,
  },
  moderate: {
    tasks_completed_last_week: 15,
    patient_activity_level: 3,
    num_alerts_last_week: 10,
    cognitive_score: 30,
    sleep_hours_avg: 5,
  },
  high: {
    tasks_completed_last_week: 20,
    patient_activity_level: 1,
    num_alerts_last_week: 14,
    cognitive_score: 10,
    sleep_hours_avg: 3,
  },
};

interface AssessmentFormProps {
  onSubmit: (data: FormData) => void;
  loading: boolean;
}

export default function AssessmentForm({ onSubmit, loading }: AssessmentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    tasks_completed_last_week: 0,
    patient_activity_level: 5,
    num_alerts_last_week: 0,
    cognitive_score: 15,
    sleep_hours_avg: 6,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let numValue = parseFloat(value);
    
    // Add validation (controll saisie) based on model constraints
    if (name === 'tasks_completed_last_week') numValue = Math.min(20, Math.max(0, numValue));
    if (name === 'patient_activity_level') numValue = Math.min(10, Math.max(0, numValue));
    if (name === 'num_alerts_last_week') numValue = Math.min(15, Math.max(0, numValue));
    if (name === 'cognitive_score') numValue = Math.min(100, Math.max(0, numValue));
    if (name === 'sleep_hours_avg') numValue = Math.min(12, Math.max(2, numValue));

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
      <h2 className="text-2xl font-bold text-foreground mb-6">Patient Assessment</h2>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {Object.entries(scenarios).map(([key, _]) => (
          <button
            key={key}
            type="button"
            onClick={() => handleScenario(key as keyof typeof scenarios)}
            className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
              key === 'low'
                ? 'bg-green-500/10 text-green-700 hover:bg-green-500/20 border border-green-200'
                : key === 'moderate'
                ? 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border border-yellow-200'
                : 'bg-red-500/10 text-red-700 hover:bg-red-500/20 border border-red-200'
            }`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              Tasks Completed Last Week (0-20)
            </label>
            <span className="text-sm font-bold text-primary">{formData.tasks_completed_last_week}</span>
          </div>
          <input
            type="range"
            name="tasks_completed_last_week"
            value={formData.tasks_completed_last_week}
            onChange={handleChange}
            min="0"
            max="20"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              Activity Level (0-10)
            </label>
            <span className="text-sm font-bold text-primary">{formData.patient_activity_level}</span>
          </div>
          <input
            type="range"
            name="patient_activity_level"
            value={formData.patient_activity_level}
            onChange={handleChange}
            min="0"
            max="10"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              Alerts Last Week (0-15)
            </label>
            <span className="text-sm font-bold text-primary">{formData.num_alerts_last_week}</span>
          </div>
          <input
            type="range"
            name="num_alerts_last_week"
            value={formData.num_alerts_last_week}
            onChange={handleChange}
            min="0"
            max="15"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <label className="block text-sm font-medium text-muted-foreground">
              Cognitive Score (0-100)
            </label>
            <span className="text-sm font-bold text-primary">{formData.cognitive_score}</span>
          </div>
          <input
            type="range"
            name="cognitive_score"
            value={formData.cognitive_score}
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
              Sleep Hours per Night (2-12)
            </label>
            <span className="text-sm font-bold text-primary">{formData.sleep_hours_avg}h</span>
          </div>
          <input
            type="range"
            name="sleep_hours_avg"
            value={formData.sleep_hours_avg}
            onChange={handleChange}
            min="2"
            max="12"
            step="1"
            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <Button type="submit" className="w-full py-6 text-lg font-bold" disabled={loading}>
          {loading ? 'Processing...' : 'Predict Workload'}
        </Button>
      </form>
    </div>
  );
}

