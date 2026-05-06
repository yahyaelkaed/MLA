"use client";

import { useState } from "react";
import { Client } from "@gradio/client";
import Navbar from "@/components/navbar";
import SeverityAssessmentForm from "@/components/severity-assessment-form";
import SeverityResultsDisplay from "@/components/severity-results-display";
import SeverityModelPerformance from "@/components/severity-model-performance";
import Footer from "@/components/footer";

export default function SeverityPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePrediction = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      const client = await Client.connect("yssfmlha/Severity");

      const payload = {
        age: Number(formData.age),
        gender: Number(formData.gender),
        severity: Number(formData.severity),
        test_last: Number(formData.test_last),
        test_mean: Number(formData.test_mean),
        test_trend: Number(formData.test_trend),
        previous_medication: Number(formData.previous_medication),
        prescribed_medication: Number(formData.prescribed_medication),
      };

      console.log("Sending Payload to HF (Severity):", payload);

      const result = await client.predict("/predict", payload);

      console.log("HF API Result (Severity):", result);

      if (result && (result as any).data) {
        const data = (result as any).data;
        setResults({
          predicted: String(data[0]),
          probs: data[1],
          formData,
        });
      } else {
        throw new Error("No data received from Severity model.");
      }
    } catch (err) {
      console.error("HF Severity Error:", err);
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
          <h1 className="text-4xl font-extrabold text-foreground mb-4">Future Severity Prediction</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Predict future Alzheimer's severity using the Random Forest model hosted as a Hugging Face Space.</p>
        </div>
      </div>

      <SeverityModelPerformance />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SeverityAssessmentForm onSubmit={handlePrediction} loading={loading} />
          <SeverityResultsDisplay results={results} error={error} onReset={handleReset} loading={loading} />
        </div>
      </div>

      <Footer />
    </main>
  );
}
