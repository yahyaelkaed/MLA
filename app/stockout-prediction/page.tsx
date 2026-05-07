"use client";

import { useState } from "react";
import { Client } from "@gradio/client";
import Navbar from "@/components/navbar";
import StockoutPredictionForm, { StockoutFormData } from "@/components/stockout-prediction-form";
import StockoutPredictionResults from "@/components/stockout-prediction-results";
import Footer from "@/components/footer";

export default function StockoutPredictionPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrediction = async (formData: StockoutFormData) => {
    setLoading(true);
    setError(null);

    try {
      const client = await Client.connect("HyperFigs/StockoutPredictionSpace");

      const payload = [
        Number(formData.lead_time_days),
        Number(formData.promotion_active),
        Number(formData.days_to_expiry),
        Number(formData.stock_quantity),
        Number(formData.prescription_quantity),
        Number(formData.frequency),
        Number(formData.snapshot_month),
        Number(formData.snapshot_dayofweek),
        formData.pharmacy_type,
        formData.medication_name,
      ];

      console.log("Sending Payload to HF (Stockout):", payload);

      const result = await client.predict("/predict", payload);

      console.log("HF API Result (Stockout):", result);

      if (result && (result as any).data) {
        const prediction = (result as any).data[0];
        setResults({ prediction, formData });
      } else {
        throw new Error("No data received from stockout model.");
      }
    } catch (err) {
      console.error("HF Stockout Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Connection failed. Ensure the Hugging Face Space is running or accessible.",
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
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Medication Stockout Prediction</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Predict how many days until a medication runs out using the XGBoost model hosted on Hugging Face.
            Thresholds: Critical ≤20 days · High ≤45 · Moderate ≤90 · Low &gt;90
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <StockoutPredictionForm onSubmit={handlePrediction} loading={loading} />
          <StockoutPredictionResults results={results} error={error} onReset={handleReset} loading={loading} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
