"use client";

import { useState } from "react";
import { Client } from "@gradio/client";
import Navbar from "@/components/navbar";
import MciAssessmentForm from "@/components/mci-assessment-form";
import MciResultsDisplay from "@/components/mci-results-display";
import MciModelPerformance from "@/components/mci-model-performance";
import Footer from "@/components/footer";

export default function MciPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePrediction = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      // Connect to Hugging Face Space for MCI Conversion
      const client = await Client.connect("NotSoHealthy/MCI_conversion");

      const payload = [
        Number(formData.age),
        Number(formData.sex),
        Number(formData.education),
        Number(formData.mmse),
        Number(formData.moca),
        Number(formData.adas_cog),
        Number(formData.cdr_sb),
        Number(formData.memory_recall),
        Number(formData.adl),
        Number(formData.iadl),
      ];

      console.log("Sending Payload to HF (MCI):", payload);

      const result = await client.predict("/predict", payload);

      console.log("HF API Result (MCI):", result);

      if (result && result.data) {
        setResults({
          prediction: String(result.data[0]),
          formData,
        });
      } else {
        throw new Error("No data received from MCI model.");
      }
    } catch (err) {
      console.error("HF MCI Error:", err);
      setError(
        err instanceof Error
          ? err.message
          : 'Connection failed. Please ensure the Hugging Face Space is "Running".',
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
          <h1 className="text-4xl font-extrabold text-foreground mb-4">
            MCI Conversion Prediction
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered risk assessment for Mild Cognitive Impairment (MCI)
            conversion to Alzheimer's Disease.
          </p>
        </div>
      </div>

      <MciModelPerformance />

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <MciAssessmentForm onSubmit={handlePrediction} loading={loading} />
          <MciResultsDisplay
            results={results}
            error={error}
            onReset={handleReset}
            loading={loading}
          />
        </div>
      </div>

      <Footer />
    </main>
  );
}
