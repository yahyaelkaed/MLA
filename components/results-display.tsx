'use client';

import React from 'react';

interface ResultsDisplayProps {
  results: any;
  error: string | null;
  onReset: () => void;
  loading: boolean;
}

export default function ResultsDisplay({ results, error, onReset, loading }: ResultsDisplayProps) {
  const getInterpretation = (hours: number) => {
    if (hours < 25) {
      return {
        level: 'low',
        title: 'Low Workload',
        description: 'Patient requires minimal caregiver attention. Focus on preventive care and monitoring.',
        color: 'green'
      };
    } else if (hours < 50) {
      return {
        level: 'moderate',
        title: 'Moderate Workload',
        description: 'Patient requires standard caregiver support. Regular monitoring and assistance needed.',
        color: 'yellow'
      };
    } else if (hours < 100) {
      return {
        level: 'high',
        title: 'High Workload',
        description: 'Patient requires significant caregiver resources. Additional support recommended.',
        color: 'orange'
      };
    } else {
      return {
        level: 'critical',
        title: 'Critical Workload',
        description: 'Patient requires intensive care. Immediate professional intervention necessary.',
        color: 'red'
      };
    }
  };

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
        <p className="text-muted-foreground font-semibold">Processing prediction...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 h-fit sticky top-24 flex flex-col items-center justify-center min-h-96">
        <p className="text-muted-foreground text-center">
          Fill in the patient assessment and click &quot;Predict Workload&quot; to see results
        </p>
      </div>
    );
  }

  const interpretation = getInterpretation(results.predicted_workload_hours);
  const colorClass = {
    green: 'from-green-500/10 to-green-500/5 border-green-200',
    yellow: 'from-yellow-500/10 to-yellow-500/5 border-yellow-200',
    orange: 'from-orange-500/10 to-orange-500/5 border-orange-200',
    red: 'from-red-500/10 to-red-500/5 border-red-200',
  }[interpretation.color];

  const titleColorClass = {
    green: 'text-green-700',
    yellow: 'text-yellow-700',
    orange: 'text-orange-700',
    red: 'text-red-700',
  }[interpretation.color];

  // Extract interpretation text from raw text if it exists
  const rawInterpretation = results.rawText ? results.rawText.split('🧠 Interpretation:')[1]?.trim() : null;

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-br ${colorClass} border rounded-xl p-8`}>
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-foreground mb-2">
            {results.predicted_workload_hours.toFixed(1)}
          </div>
          <div className={`text-xl font-bold ${titleColorClass}`}>
            {interpretation.title}
          </div>
          <p className="text-muted-foreground font-semibold">hours per week</p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-background/50 rounded-full">
            <span className="text-sm text-muted-foreground">Confidence:</span>
            <span className="font-bold text-foreground">{(results.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">Standard Recommendation</h4>
            <p className="text-sm text-muted-foreground">{interpretation.description}</p>
          </div>

          {rawInterpretation && (
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <span>🧠</span> AI Interpretation
              </h4>
              <p className="text-sm text-muted-foreground italic tracking-tight leading-relaxed">
                {rawInterpretation}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <h4 className="font-semibold text-foreground mb-4">Assessment Summary</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Tasks</p>
            <p className="text-xl font-bold text-foreground">{results.formData.tasks_completed_last_week}</p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Activity</p>
            <p className="text-xl font-bold text-foreground">{Math.round(results.formData.patient_activity_level)}/10</p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Alerts</p>
            <p className="text-xl font-bold text-foreground">{results.formData.num_alerts_last_week}</p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Cognition</p>
            <p className="text-xl font-bold text-foreground">{results.formData.cognitive_score}</p>
          </div>
          <div className="bg-secondary rounded-lg p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Sleep</p>
            <p className="text-xl font-bold text-foreground">{results.formData.sleep_hours_avg}h</p>
          </div>
          <div className="bg-primary/10 rounded-lg p-3 border border-primary/30">
            <p className="text-xs font-semibold text-primary mb-1">Prediction</p>
            <p className="text-xl font-bold text-primary">{results.predicted_workload_hours.toFixed(1)}h/wk</p>
          </div>
        </div>
      </div>

      <button
        onClick={onReset}
        className="w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-semibold hover:bg-secondary/80 transition"
      >
        New Assessment
      </button>
    </div>
  );
}

