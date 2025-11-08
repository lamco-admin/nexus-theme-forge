import React from 'react';
import { QueueStatsWidget } from './widgets/QueueStatsWidget';
import { AgentPerformanceWidget } from './widgets/AgentPerformanceWidget';
import { CustomerProfileWidget } from './widgets/CustomerProfileWidget';

export const DashboardShowcase: React.FC = () => {
  return (
    <div className="w-full min-h-screen p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Lamco Call Center Platform</h1>
        <p className="text-lg text-muted-foreground">
          Customizable dashboard system with comprehensive theming
        </p>
      </div>

      {/* Dashboard Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Queue Stats and Performance */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[400px]">
            <QueueStatsWidget />
          </div>
          
          <div className="h-[500px]">
            <AgentPerformanceWidget />
          </div>
        </div>

        {/* Right Column - Customer Profile */}
        <div className="lg:col-span-4">
          <div className="sticky top-6 h-[920px]">
            <CustomerProfileWidget />
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <div className="p-6 rounded-lg border bg-card space-y-2">
          <h3 className="font-semibold text-lg">🎨 Multiple Themes</h3>
          <p className="text-sm text-muted-foreground">
            Professional, Modern, Minimal, and High Contrast themes with light/dark modes
          </p>
        </div>
        
        <div className="p-6 rounded-lg border bg-card space-y-2">
          <h3 className="font-semibold text-lg">🧩 Widget System</h3>
          <p className="text-sm text-muted-foreground">
            Modular components designed for drag-and-drop customization
          </p>
        </div>
        
        <div className="p-6 rounded-lg border bg-card space-y-2">
          <h3 className="font-semibold text-lg">♿ Accessible</h3>
          <p className="text-sm text-muted-foreground">
            WCAG AAA compliant high contrast theme for maximum accessibility
          </p>
        </div>
      </div>
    </div>
  );
};
