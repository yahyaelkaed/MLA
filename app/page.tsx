'use client';

import { useState } from 'react';
import { Client } from "@gradio/client";
import Navbar from '@/components/navbar';
import Hero from '@/components/hero';
import AssessmentForm from '@/components/assessment-form';
import ResultsDisplay from '@/components/results-display';
import ModelPerformance from '@/components/model-performance';
import Footer from '@/components/footer';

export default function Home() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePrediction = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      // Connect to Hugging Face Space
      // Using an alternative approach: direct predict without persistent client if connect is failing
      const client = await Client.connect("yahyaelkaed/workload-predictor-app", {
        // Optional: you can add a token here if the space is private
        // hf_token: "your_token" 
      });
      
      const payload = [ 		
        Number(formData.tasks_completed_last_week), 
        Number(formData.patient_activity_level),    
        Number(formData.num_alerts_last_week),      
        Number(formData.cognitive_score),           
        Number(formData.sleep_hours_avg),           
      ];

      console.log("Sending Payload to HF:", payload);

      const result = await client.predict("/predict", payload);

      console.log("HF API Result:", result);

      if (result && result.data) {
        const rawResult = String(result.data[0]);
        // Handle both "Predicted Workload: X" and raw numbers
        const hoursMatch = rawResult.match(/Predicted Workload:\s*([\d.]+)/i);
        const hours = hoursMatch ? parseFloat(hoursMatch[1]) : parseFloat(rawResult) || 0;

        setResults({ 
          predicted_workload_hours: hours,
          confidence: 0.9447, 
          rawText: rawResult,
          formData 
        });
      } else {
        throw new Error("No data received from model.");
      }
    } catch (err) {
      // If the error object is empty, log properties specifically
      console.error("HF Error Type:", typeof err);
      console.error("HF Error Message:", err instanceof Error ? err.message : "Unknown Error");
      console.error("HF Error Raw:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
      
      setError(err instanceof Error ? err.message : 'Connection failed. Please ensure the Hugging Face Space is "Running" and not "Sleeping".');
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
      <Hero />
      <ModelPerformance />
      
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AssessmentForm onSubmit={handlePrediction} loading={loading} />
          <ResultsDisplay 
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
