import React from 'react';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-lg">CW</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Caregiver Workload</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI Prediction Tool</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
