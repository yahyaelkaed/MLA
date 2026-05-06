"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

export interface EarlyDetectionFormData {
  age: number;
  ScoreCognitif: number;
  NiveauMobilite: number;
  ScoreStabiliteEquilibre: number;
  NombreChutesRecentes: number;
  NombreFuguesRecentes: number;
  NiveauAnxiete: number;
  NombreMaladiesChroniques: number;
}

const scenarios = {
  baseline: {
    age: 70,
    ScoreCognitif: 20,
    NiveauMobilite: 0,
    ScoreStabiliteEquilibre: 20,
    NombreChutesRecentes: 0,
    NombreFuguesRecentes: 0,
    NiveauAnxiete: 0,
    NombreMaladiesChroniques: 0,
  },
  high_risk: {
    age: 85,
    ScoreCognitif: 10,
    NiveauMobilite: 2,
    ScoreStabiliteEquilibre: 5,
    NombreChutesRecentes: 3,
    NombreFuguesRecentes: 1,
    NiveauAnxiete: 2,
    NombreMaladiesChroniques: 3,
  },
};

interface EarlyDetectionFormProps {
  onSubmit: (data: EarlyDetectionFormData) => void;
  loading: boolean;
}

export default function EarlyDetectionForm({
  onSubmit,
  loading,
}: EarlyDetectionFormProps) {
  const [formData, setFormData] = useState<EarlyDetectionFormData>(scenarios.baseline);

  const handleChange = (name: keyof EarlyDetectionFormData, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-8 h-fit sticky top-24">
      <h2 className="text-2xl font-bold text-foreground mb-6">Patient Assessment</h2>

      <div className="grid grid-cols-2 gap-2 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormData(scenarios.baseline)}
          className="text-xs"
        >
          Baseline Scenario
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFormData(scenarios.high_risk)}
          className="text-xs"
        >
          High Risk Scenario
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="age">Age</Label>
            <span className="text-sm font-medium text-primary">{formData.age}</span>
          </div>
          <Slider
            id="age"
            min={50}
            max={100}
            step={1}
            value={[formData.age]}
            onValueChange={(val) => handleChange("age", val[0])}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label htmlFor="ScoreCognitif">Cognitive Score (0-30)</Label>
            <span className="text-sm font-medium text-primary">{formData.ScoreCognitif}</span>
          </div>
          <Slider
            id="ScoreCognitif"
            min={0}
            max={30}
            step={1}
            value={[formData.ScoreCognitif]}
            onValueChange={(val) => handleChange("ScoreCognitif", val[0])}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="NiveauMobilite">Mobility Level</Label>
            <Input
              id="NiveauMobilite"
              type="number"
              min={0}
              max={5}
              value={formData.NiveauMobilite}
              onChange={(e) => handleChange("NiveauMobilite", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ScoreStabiliteEquilibre">Stability/Balance Score</Label>
            <Input
              id="ScoreStabiliteEquilibre"
              type="number"
              min={0}
              max={30}
              value={formData.ScoreStabiliteEquilibre}
              onChange={(e) => handleChange("ScoreStabiliteEquilibre", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="NombreChutesRecentes">Recent Falls</Label>
            <Input
              id="NombreChutesRecentes"
              type="number"
              min={0}
              value={formData.NombreChutesRecentes}
              onChange={(e) => handleChange("NombreChutesRecentes", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="NombreFuguesRecentes">Recent Wandering Events</Label>
            <Input
              id="NombreFuguesRecentes"
              type="number"
              min={0}
              value={formData.NombreFuguesRecentes}
              onChange={(e) => handleChange("NombreFuguesRecentes", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="NiveauAnxiete">Anxiety Level</Label>
            <Input
              id="NiveauAnxiete"
              type="number"
              min={0}
              max={10}
              value={formData.NiveauAnxiete}
              onChange={(e) => handleChange("NiveauAnxiete", parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="NombreMaladiesChroniques">Chronic Conditions</Label>
            <Input
              id="NombreMaladiesChroniques"
              type="number"
              min={0}
              value={formData.NombreMaladiesChroniques}
              onChange={(e) => handleChange("NombreMaladiesChroniques", parseInt(e.target.value) || 0)}
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading}>
          {loading ? "Analyzing..." : "Submit Assessment"}
        </Button>
      </form>
    </div>
  );
}
