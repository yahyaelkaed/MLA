"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from "recharts";

const performanceData = [
  { name: "Accuracy", value: 94.2 },
  { name: "Precision", value: 92.5 },
  { name: "Recall", value: 91.8 },
  { name: "F1 Score", value: 92.1 },
];

const featureImportance = [
  { name: "ScoreCognitif", importance: 0.35 },
  { name: "Age", importance: 0.18 },
  { name: "ScoreStabilite", importance: 0.15 },
  { name: "NiveauMobilite", importance: 0.12 },
  { name: "Anxiety", importance: 0.08 },
  { name: "Others", importance: 0.12 },
];

const COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#64748b"];

export default function EarlyDetectionPerformance() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceData.map((item) => (
          <Card key={item.name} className="bg-background/80 backdrop-blur-sm border-primary/20">
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-muted-foreground mb-1">{item.name}</div>
              <div className="text-3xl font-bold text-primary">{item.value}%</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feature Importance</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={100} 
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {featureImportance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Model Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <h4 className="font-semibold text-primary mb-1">XGBoost Architecture</h4>
              <p className="text-sm text-muted-foreground">
                Gradient Boosting Decision Trees optimized for medical classification tasks. 
                Highly effective at handling non-linear relationships between cognitive scores and physical stability.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Loss Function</div>
                <div className="font-semibold">Binary Logistic</div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Validation</div>
                <div className="font-semibold">Stratified K-Fold</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
