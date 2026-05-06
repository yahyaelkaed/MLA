"use client";

import { useState } from "react";
import { Client } from "@gradio/client";
import Navbar from "@/components/navbar";
import EarlyDetectionForm from "@/components/early-detection/early-detection-form";
import EarlyDetectionResults from "@/components/early-detection/early-detection-results";
import EarlyDetectionPerformance from "@/components/early-detection/early-detection-performance";
import Footer from "@/components/footer";

export default function EarlyDetectionPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrediction = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      const client = await Client.connect("yappa123/classification");

      const payload = [
        Number(formData.age),
        Number(formData.ScoreCognitif),
        Number(formData.NiveauMobilite),
        Number(formData.ScoreStabiliteEquilibre),
        Number(formData.NombreChutesRecentes),
        Number(formData.NombreFuguesRecentes),
        Number(formData.NiveauAnxiete),
        Number(formData.NombreMaladiesChroniques),
      ];

      console.log("Sending Payload to HF (Early Detection):", payload);

      const result = await client.predict("/predict", payload);

      console.log("HF API Result (Early Detection):", result);

      if (result && (result as any).data) {
        const data = (result as any).data;
        setResults({
          predictedStatus: String(data[0]),
          confidence: String(data[1]),
          formData,
        });
      } else {
        throw new Error("No data received from Early Detection model.");
      }
    } catch (err) {
      console.error("HF Early Detection Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : 'Connection failed. Ensure the Hugging Face Space is running or accessible.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
  };

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="bg-primary/5 border-b border-primary/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Alzheimer Early Detection</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            XGBoost model for risk prediction based on cognitive and mobility scores.
          </p>
        </div>
      </div>

      <EarlyDetectionPerformance />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EarlyDetectionForm onSubmit={handlePrediction} loading={loading} />
          <EarlyDetectionResults results={results} error={error} onReset={handleReset} loading={loading} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
