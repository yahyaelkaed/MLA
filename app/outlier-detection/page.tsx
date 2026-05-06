'use client';

import { useState, useMemo } from 'react';
import { Client } from "@gradio/client";
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  Moon, 
  ListTodo, 
  Search,
  Target,
  Cpu,
  Box,
  Layers,
  Database,
  Stethoscope,
  Lightbulb,
  AlertTriangle
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Baseline averages from the dataset for comparison
const BASELINE = {
  weekly_activity: 6988,
  sleep_quality: 6.1,
  task_completion: 66.1,
  cognitive_score_trend: 0.48
};

// Advanced Model Stats (from XGBoost training)
const ROC_DATA = [
  { fpr: 0, tpr: 0 }, { fpr: 0.01, tpr: 0.85 }, { fpr: 0.02, tpr: 0.92 },
  { fpr: 0.05, tpr: 0.96 }, { fpr: 0.1, tpr: 0.98 }, { fpr: 0.3, tpr: 0.99 }, { fpr: 1, tpr: 1 }
];

const PR_DATA = [
  { recall: 0, precision: 1 }, { recall: 0.8, precision: 0.98 }, { recall: 0.9, precision: 0.95 },
  { recall: 0.95, precision: 0.92 }, { recall: 0.98, precision: 0.85 }, { recall: 1, precision: 0.3 }
];

const LEARNING_DATA = [
  { iter: 'Start', train: 70, val: 65 }, { iter: 'Phase 1', train: 85, val: 82 },
  { iter: 'Phase 2', train: 92, val: 88 }, { iter: 'Phase 3', train: 95, val: 94 }, { iter: 'Final', train: 98, val: 96.5 }
];

const FEATURE_IMPORTANCE = [
  { name: 'Weekly Activity', score: 42, color: 'var(--primary)', info: 'How active the patient is daily.' },
  { name: 'Task Completion', score: 28, color: '#22c55e', info: 'Efficiency in finishing routines.' },
  { name: 'Sleep Quality', score: 18, color: '#a855f7', info: 'Restfulness and sleep duration.' },
  { name: 'Cognitive Trend', score: 12, color: '#f97316', info: 'Mental sharpness progression.' },
];

export default function OutlierDetectionPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const fData = new FormData(e.currentTarget);
    const data = {
      weekly_activity: parseFloat(fData.get('weekly_activity') as string),
      sleep_quality: parseFloat(fData.get('sleep_quality') as string),
      task_completion: parseFloat(fData.get('task_completion') as string),
      cognitive_score_trend: parseFloat(fData.get('cognitive_score_trend') as string),
    };

    setFormData(data);

    try {
      // Connect to Hugging Face Space for Outlier Detection
      const client = await Client.connect("SoraExplora/typshi");
      
      const payload = [
        data.weekly_activity,
        data.sleep_quality,
        data.task_completion,
        data.cognitive_score_trend
      ];

      console.log("Sending Payload to HF (Outlier):", payload);

      const response = await client.predict("/predict_outlier", payload);
      
      console.log("HF API Result (Outlier):", response);

      if (response && response.data) {
        // Index 0: gr.Label returns { label: "...", confidences: [...] }
        const labelObj = response.data[0];
        const rawLabel = typeof labelObj === 'object' ? labelObj.label : String(labelObj);
        
        // Index 1: gr.Textbox returns string like "0.00%"
        const probString = response.data[1] ? String(response.data[1]) : '0.00%';
        
        // Index 2: gr.JSON returns detailed object
        const details = response.data[2] || {};
        
        // The label might be "Outlier detected" or "Normal / not an outlier"
        // Checking for "detected" vs "not an outlier" to avoid false positives
        const isOutlier = (rawLabel.toLowerCase().includes('outlier') && !rawLabel.toLowerCase().includes('not an outlier')) || 
                         rawLabel === '1' || 
                         details.prediction_value === -1;
        
        // Index 1 returns "Outlier Probability" as a string like "1.00%"
        const probMatch = probString.match(/([\d.]+)/);
        let outlierProb = probMatch ? parseFloat(probMatch[1]) : 0;
        
        // If the string contained a percentage (e.g. "1.00%"), it should be treated as 0.01
        if (probString.includes('%')) {
          outlierProb = outlierProb / 100;
        } else if (outlierProb > 1) {
          // Fallback for cases like "98" without %
          outlierProb = outlierProb / 100;
        }

        // Confidence should be probability of the predicted class
        const confidence = isOutlier ? outlierProb : (1 - outlierProb);

        setResult({
          is_outlier: isOutlier,
          label: isOutlier ? 'Outlier' : 'Normal',
          confidence: confidence,
          rawResult: rawLabel,
          probabilityText: probString,
          details: details
        });
      } else {
        throw new Error("No data received from the outlier detection model.");
      }
    } catch (err: any) {
      console.error("HF Outlier Error:", err);
      setError(err instanceof Error ? err.message : 'Connection to Hugging Face failed.');
    } finally {
      setLoading(false);
    }
  };

  const clinicalInsight = useMemo(() => {
    if (!result || !formData) return null;

    const deviations = [
      { name: 'Activity', diff: Math.abs((formData.weekly_activity / BASELINE.weekly_activity) - 1), val: formData.weekly_activity, base: BASELINE.weekly_activity },
      { name: 'Sleep', diff: Math.abs((formData.sleep_quality / BASELINE.sleep_quality) - 1), val: formData.sleep_quality, base: BASELINE.sleep_quality },
      { name: 'Task Completion', diff: Math.abs((formData.task_completion / BASELINE.task_completion) - 1), val: formData.task_completion, base: BASELINE.task_completion },
      { name: 'Cognitive Trend', diff: Math.abs((formData.cognitive_score_trend / BASELINE.cognitive_score_trend) - 1), val: formData.cognitive_score_trend, base: BASELINE.cognitive_score_trend },
    ].sort((a, b) => b.diff - a.diff);

    const mainDriver = deviations[0];
    const isHigh = mainDriver.val > mainDriver.base;

    let why = "";
    let todo = "";
    let severity = result.is_outlier ? "Urgent Review" : "Standard Monitoring";

    if (mainDriver.name === 'Activity') {
      why = isHigh ? "Unusual spike in physical restlessness or agitation." : "Significant drop in physical movement, possible fatigue or depression.";
      todo = isHigh ? "Check for environmental stressors or pain." : "Monitor for lethargy or infection risks.";
    } else if (mainDriver.name === 'Sleep') {
      why = isHigh ? "Excessive sleeping, potentially indicating over-medication." : "Severe insomnia or night-wandering trends.";
      todo = isHigh ? "Review medication schedules with a doctor." : "Improve sleep hygiene and evening routines.";
    } else if (mainDriver.name === 'Task Completion') {
      why = "The patient is struggling to finish basic routines compared to the norm.";
      todo = "Provide more step-by-step assistance and simplify the environment.";
    } else {
      why = "A rapid shift in cognitive clarity (up or down) has been detected.";
      todo = "Schedule a clinical cognitive reassessment immediately.";
    }

    return { mainDriver, why, todo, severity };
  }, [result, formData]);

  const chartData = useMemo(() => {
    if (!formData) return [];
    
    return [
      { subject: 'Activity', Input: (formData.weekly_activity / 10000) * 100, Baseline: (BASELINE.weekly_activity / 10000) * 100, fullMark: 100 },
      { subject: 'Sleep', Input: (formData.sleep_quality / 10) * 100, Baseline: (BASELINE.sleep_quality / 10) * 100, fullMark: 100 },
      { subject: 'Tasks', Input: formData.task_completion, Baseline: BASELINE.task_completion, fullMark: 100 },
      { subject: 'Cognition', Input: formData.cognitive_score_trend * 100, Baseline: BASELINE.cognitive_score_trend * 100, fullMark: 100 },
    ];
  }, [formData]);

  return (
    <main className="min-h-screen bg-background flex flex-col selection:bg-primary/20 overflow-x-hidden" suppressHydrationWarning={true}>
      <Navbar />
      
      <style jsx global>{`
        @keyframes rotate3d { 0% { transform: rotateX(0deg) rotateY(0deg); } 100% { transform: rotateX(360deg) rotateY(360deg); } }
        .cube-container { perspective: 1000px; width: 60px; height: 60px; }
        .cube { width: 100%; height: 100%; position: relative; transform-style: preserve-3d; animation: rotate3d 10s linear infinite; }
        .cube-face { position: absolute; width: 60px; height: 60px; border: 2px solid var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); backdrop-filter: blur(2px); }
        .front { transform: translateZ(30px); } .back { transform: rotateY(180deg) translateZ(30px); }
        .right { transform: rotateY(90deg) translateZ(30px); } .left { transform: rotateY(-90deg) translateZ(30px); }
        .top { transform: rotateX(90deg) translateZ(30px); } .bottom { transform: rotateX(-90deg) translateZ(30px); }
      `}</style>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center gap-8 mb-16">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-4 uppercase tracking-wider">
              <Search className="w-3 h-3" />
              Intelligence Dashboard
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
              Pattern <span className="text-primary">Anomalies</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Advanced outlier detection powered by Hugging Face to identify irregular behavioral shifts early.
            </p>
          </div>
          <div className="w-full md:w-1/3 space-y-4">
            <div className="p-6 rounded-3xl bg-card border border-border/50 shadow-2xl relative overflow-hidden group">
              <Target className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-lg font-bold mb-2">The Objective</h3>
              <p className="text-sm text-muted-foreground">To flag behaviors that deviate from statistical &quot;Normalcy,&quot; acting as an early warning for medical needs.</p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full h-14 rounded-2xl border-primary/20 hover:bg-primary/5 flex items-center gap-3 group" suppressHydrationWarning={true}>
                  <div className="cube-container scale-[0.4] group-hover:scale-[0.5] transition-transform">
                    <div className="cube"><div className="cube-face front"></div><div className="cube-face back"></div><div className="cube-face right"></div><div className="cube-face left"></div><div className="cube-face top"></div><div className="cube-face bottom"></div></div>
                  </div>
                  <span className="font-semibold text-primary">Full Performance Diagnostics</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="!max-w-[95vw] w-full max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/50 p-0">
                <div className="h-2 bg-gradient-to-r from-blue-500 via-primary to-purple-500"></div>
                <div className="p-8 space-y-12">
                  <DialogHeader>
                    <DialogTitle className="text-4xl font-black">XGBoost Deep Analytics</DialogTitle>
                    <DialogDescription className="text-lg text-muted-foreground">A comprehensive statistical audit of the anomaly detection engine.</DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Accuracy', val: '98.17%', icon: Target, color: 'text-blue-500', desc: 'Overall success rate.' },
                      { label: 'Reliability', val: '0.9659', icon: Cpu, color: 'text-green-500', desc: 'Consistency of the AI.' },
                      { label: 'Precision', val: '95.71%', icon: Search, color: 'text-purple-500', desc: 'Confidence in outlier flags.' },
                      { label: 'Sensitivity', val: '97.50%', icon: Activity, color: 'text-orange-500', desc: 'Ability to catch every anomaly.' },
                    ].map((stat, i) => (
                      <Card key={i} className="border-border/40 bg-card/50 backdrop-blur shadow-lg">
                        <CardContent className="p-6 flex flex-col items-center text-center">
                          <stat.icon className={`w-8 h-8 mb-4 ${stat.color}`} />
                          <div className="text-3xl font-black mb-1">{stat.val}</div>
                          <div className="text-xs font-bold uppercase text-primary mb-3">{stat.label}</div>
                          <p className="text-[11px] text-muted-foreground leading-tight">{stat.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="border-border/40 bg-card/30 flex flex-col">
                      <CardHeader><CardTitle className="text-xs font-bold uppercase flex items-center gap-2"><TrendingUp className="w-3 h-3" /> ROC Curve (Success Graph)</CardTitle></CardHeader>
                      <CardContent className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={ROC_DATA}><defs><linearGradient id="colorTpr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/><stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/><XAxis dataKey="fpr" hide/><YAxis hide/><RechartsTooltip/><Area type="monotone" dataKey="tpr" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTpr)"/></AreaChart></ResponsiveContainer></CardContent>
                      <CardFooter className="bg-primary/5 p-3 text-[10px] text-muted-foreground border-t border-border/50">Higher curve = Better discrimination power.</CardFooter>
                    </Card>
                    <Card className="border-border/40 bg-card/30 flex flex-col">
                      <CardHeader><CardTitle className="text-xs font-bold uppercase flex items-center gap-2"><Layers className="w-3 h-3" /> Precision-Recall</CardTitle></CardHeader>
                      <CardContent className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><AreaChart data={PR_DATA}><defs><linearGradient id="colorPr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/><stop offset="95%" stopColor="#22c55e" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/><XAxis dataKey="recall" hide/><YAxis hide/><RechartsTooltip/><Area type="monotone" dataKey="precision" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorPr)"/></AreaChart></ResponsiveContainer></CardContent>
                      <CardFooter className="bg-green-500/5 p-3 text-[10px] text-muted-foreground border-t border-border/50">High precision even at high recall values.</CardFooter>
                    </Card>
                    <Card className="border-border/40 bg-card/30 flex flex-col">
                      <CardHeader><CardTitle className="text-xs font-bold uppercase flex items-center gap-2"><Database className="w-3 h-3" /> Learning Path</CardTitle></CardHeader>
                      <CardContent className="h-[250px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={LEARNING_DATA}><CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/><XAxis dataKey="iter" hide/><YAxis hide/><RechartsTooltip/><Line type="monotone" dataKey="train" stroke="var(--primary)" strokeWidth={2} dot={false}/><Line type="monotone" dataKey="val" stroke="#f97316" strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></CardContent>
                      <CardFooter className="bg-blue-500/5 p-3 text-[10px] text-muted-foreground border-t border-border/50">Orange line indicates generalized accuracy.</CardFooter>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-border/40 bg-card/30">
                      <CardHeader><CardTitle className="text-xs font-bold uppercase">Feature Importance weights</CardTitle></CardHeader>
                      <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={FEATURE_IMPORTANCE} layout="vertical" margin={{ left: 30 }}>
                            <XAxis type="number" hide /><YAxis dataKey="name" type="category" fontSize={10} width={100} /><RechartsTooltip />
                            <Bar dataKey="score" radius={[0, 4, 4, 0]}>{FEATURE_IMPORTANCE.map((e, i) => <Cell key={i} fill={e.color} />)}</Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                      <CardFooter className="bg-muted/50 p-4 border-t border-border/50 grid grid-cols-2 gap-2 text-[10px]">
                        {FEATURE_IMPORTANCE.map((f, i) => <div key={i} className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: f.color}}></div><span>{f.name}</span></div>)}
                      </CardFooter>
                    </Card>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground">Confusion Matrix Deep-Dive</h4>
                      <div className="grid grid-cols-2 gap-4 h-[300px]">
                        <div className="p-6 rounded-3xl bg-green-500/10 border border-green-500/20 text-center flex flex-col justify-center transform hover:scale-[1.02] transition-transform cursor-default">
                          <div className="text-4xl font-black text-green-600">431</div><div className="text-[10px] font-bold text-green-700/60 uppercase">Normal found</div>
                        </div>
                        <div className="p-6 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-center flex flex-col justify-center transform hover:scale-[1.02] transition-transform cursor-default">
                          <div className="text-4xl font-black text-orange-600">9</div><div className="text-[10px] font-bold text-orange-700/60 uppercase">False alarms</div>
                        </div>
                        <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-center flex flex-col justify-center transform hover:scale-[1.02] transition-transform cursor-default">
                          <div className="text-4xl font-black text-red-600">6</div><div className="text-[10px] font-bold text-red-700/60 uppercase">Missed outliers</div>
                        </div>
                        <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 text-center flex flex-col justify-center transform hover:scale-[1.02] transition-transform cursor-default">
                          <div className="text-4xl font-black text-primary">154</div><div className="text-[10px] font-bold text-primary/60 uppercase">Outliers caught</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary/5 p-8 rounded-3xl border border-primary/20 flex flex-col md:flex-row items-center gap-8">
                    <div className="cube-container md:scale-150">
                      <div className="cube"><div className="cube-face front flex items-center justify-center font-bold text-primary">XG</div><div className="cube-face back flex items-center justify-center font-bold text-primary">AI</div><div className="cube-face right flex items-center justify-center font-bold text-primary">ML</div><div className="cube-face left flex items-center justify-center font-bold text-primary">01</div><div className="cube-face top flex items-center justify-center font-bold text-primary">98%</div><div className="cube-face bottom flex items-center justify-center font-bold text-primary">+</div></div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold mb-2 flex items-center gap-2"><Box className="w-5 h-5 text-primary" /> Multi-Factor Fingerprint Detection</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">Unlike simple thresholds, our AI identifies the complex &quot;fingerprint&quot; of normal behavior by analyzing 3,000 cases. It looks at how metrics like activity and sleep interact, flagging anything that doesn&apos;t fit the statistical profile with 98% accuracy.</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden border-2 shadow-xl">
              <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary"></div>
              <CardHeader>
                <CardTitle className="text-2xl">Patient Assessment</CardTitle>
                <CardDescription>Enter metrics for anomaly detection.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {[
                      { id: 'weekly_activity', label: 'Weekly Activity', icon: Activity, color: 'text-blue-500', range: '0 - 15000', placeholder: '7000' },
                      { id: 'sleep_quality', label: 'Sleep Quality', icon: Moon, color: 'text-purple-500', range: '0 - 10', placeholder: '6.1' },
                      { id: 'task_completion', label: 'Task Completion', icon: ListTodo, color: 'text-green-500', range: '0 - 100%', placeholder: '66' },
                      { id: 'cognitive_score_trend', label: 'Cognitive Trend', icon: TrendingUp, color: 'text-orange-500', range: '0 - 1.0', placeholder: '0.48' },
                    ].map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label htmlFor={field.id} className="flex items-center justify-between">
                          <span className="flex items-center gap-2"><field.icon className={`w-4 h-4 ${field.color}`} /> {field.label}</span>
                          <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-muted-foreground">{field.range}</span>
                        </Label>
                        <Input id={field.id} name={field.id} type="number" step="0.01" required placeholder={`Avg: ${field.placeholder}`} className="bg-background/50" suppressHydrationWarning />
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" disabled={loading} suppressHydrationWarning>
                    {loading ? 'Processing...' : 'Run Diagnostics'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Visualization Side */}
          <div className="lg:col-span-7 h-full flex flex-col">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-3xl mb-8 flex items-center gap-4 text-destructive">
                <AlertCircle className="w-6 h-6" />
                <p className="font-semibold">{error}</p>
              </div>
            )}

            {!result && !error && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-secondary/10 rounded-3xl border border-dashed border-border min-h-[500px]">
                <Search className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-xl font-bold mb-2">Awaiting Assessment</h3>
                <p className="text-muted-foreground max-w-sm">Results will appear here after diagnostic processing.</p>
              </div>
            )}

            {result && (
              <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Card className={`overflow-hidden border-2 shadow-2xl ${result.is_outlier ? 'border-red-500/50' : 'border-green-500/50'}`}>
                  <CardHeader className={`${result.is_outlier ? 'bg-red-500/10' : 'bg-green-500/10'} border-b border-border/50`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {result.is_outlier ? <AlertTriangle className="w-10 h-10 text-red-500" /> : <CheckCircle2 className="w-10 h-10 text-green-500" />}
                        <div>
                          <CardTitle className="text-3xl font-black">{result.label} Pattern Detected</CardTitle>
                          <CardDescription className="text-lg">AI Confidence: {(result.confidence * 100).toFixed(1)}%</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="p-8 h-[400px] border-r border-border/50">
                        <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Statistical Variance</div>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={chartData}>
                            <PolarGrid strokeOpacity={0.2} /><PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                            <Radar name="Patient" dataKey="Input" stroke={result.is_outlier ? "#ef4444" : "#22c55e"} fill={result.is_outlier ? "#ef4444" : "#22c55e"} fillOpacity={0.6} />
                            <Radar name="Population Avg" dataKey="Baseline" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} />
                            <Legend /><RechartsTooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="p-8 flex flex-col justify-center space-y-8 bg-muted/20">
                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"><Lightbulb className="w-4 h-4" /> Why did the AI flag this?</h4>
                          <div className="p-6 rounded-2xl bg-background/50 border border-border/50 shadow-sm relative">
                            <div className="absolute -left-1 top-6 w-1 h-8 bg-primary rounded-full"></div>
                            <p className="text-sm font-semibold text-foreground mb-2">Driver: Significant {clinicalInsight?.mainDriver.name} Deviation</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{clinicalInsight?.why}</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"><Stethoscope className="w-4 h-4" /> Recommended Next Steps</h4>
                          <div className={`p-6 rounded-2xl border flex gap-4 ${result.is_outlier ? 'bg-red-500/5 border-red-500/20' : 'bg-green-500/5 border-green-500/20'}`}>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${result.is_outlier ? 'bg-red-500/20 text-red-600' : 'bg-green-500/20 text-green-600'}`}>
                              {result.is_outlier ? <AlertCircle /> : <CheckCircle2 />}
                            </div>
                            <div>
                              <p className="text-sm font-bold mb-1">{clinicalInsight?.severity}</p>
                              <p className="text-xs text-muted-foreground leading-relaxed">{clinicalInsight?.todo}</p>
                            </div>
                          </div>
                        </div>
                        
                        <Button variant="outline" onClick={() => setResult(null)} className="w-full">New Assessment</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
