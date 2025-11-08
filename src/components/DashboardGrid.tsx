import React, { useState, useEffect } from 'react';
import GridLayout, { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-grid-layout/css/styles.css';
import { Button } from './ui/button';
import { Edit, Save, Plus, LayoutGrid } from 'lucide-react';
import { QueueStatsWidget } from './widgets/QueueStatsWidget';
import { AgentPerformanceWidget } from './widgets/AgentPerformanceWidget';
import { CustomerProfileWidget } from './widgets/CustomerProfileWidget';
import { CallControlsWidget } from './widgets/CallControlsWidget';
import { AgentMonitorWidget } from './widgets/AgentMonitorWidget';
import { CampaignStatsWidget } from './widgets/CampaignStatsWidget';
import { WidgetPalette } from './WidgetPalette';
import { toast } from '@/hooks/use-toast';

export type UserRole = 'agent' | 'supervisor' | 'admin';

interface Widget {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  component: string;
  minW?: number;
  minH?: number;
}

interface DashboardGridProps {
  role: UserRole;
}

const WIDGET_COMPONENTS = {
  'QueueStats': QueueStatsWidget,
  'AgentPerformance': AgentPerformanceWidget,
  'CustomerProfile': CustomerProfileWidget,
  'CallControls': CallControlsWidget,
  'AgentMonitor': AgentMonitorWidget,
  'CampaignStats': CampaignStatsWidget,
};

const DEFAULT_LAYOUTS: Record<UserRole, Widget[]> = {
  agent: [
    { i: 'call-controls', x: 0, y: 0, w: 8, h: 6, component: 'CallControls', minW: 6, minH: 5 },
    { i: 'customer-profile', x: 8, y: 0, w: 4, h: 6, component: 'CustomerProfile', minW: 3, minH: 4 },
    { i: 'performance', x: 0, y: 6, w: 6, h: 4, component: 'AgentPerformance', minW: 4, minH: 3 },
    { i: 'queue-stats', x: 6, y: 6, w: 6, h: 4, component: 'QueueStats', minW: 4, minH: 3 },
  ],
  supervisor: [
    { i: 'queue-stats', x: 0, y: 0, w: 4, h: 3, component: 'QueueStats', minW: 3, minH: 2 },
    { i: 'campaign-stats', x: 4, y: 0, w: 4, h: 3, component: 'CampaignStats', minW: 3, minH: 2 },
    { i: 'performance', x: 8, y: 0, w: 4, h: 3, component: 'AgentPerformance', minW: 3, minH: 2 },
    { i: 'agent-monitor', x: 0, y: 3, w: 12, h: 5, component: 'AgentMonitor', minW: 8, minH: 4 },
  ],
  admin: [
    { i: 'queue-stats', x: 0, y: 0, w: 3, h: 3, component: 'QueueStats', minW: 3, minH: 2 },
    { i: 'campaign-stats', x: 3, y: 0, w: 3, h: 3, component: 'CampaignStats', minW: 3, minH: 2 },
    { i: 'performance', x: 6, y: 0, w: 3, h: 3, component: 'AgentPerformance', minW: 3, minH: 2 },
    { i: 'customer-profile', x: 9, y: 0, w: 3, h: 3, component: 'CustomerProfile', minW: 3, minH: 2 },
    { i: 'agent-monitor', x: 0, y: 3, w: 12, h: 5, component: 'AgentMonitor', minW: 8, minH: 4 },
  ],
};

export const DashboardGrid: React.FC<DashboardGridProps> = ({ role }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([]);

  useEffect(() => {
    // Load saved layout or use default
    const savedLayout = localStorage.getItem(`dashboard-layout-${role}`);
    if (savedLayout) {
      setWidgets(JSON.parse(savedLayout));
    } else {
      setWidgets(DEFAULT_LAYOUTS[role]);
    }
  }, [role]);

  const handleLayoutChange = (layout: Layout[]) => {
    if (!isEditMode) return;

    const updatedWidgets = widgets.map(widget => {
      const layoutItem = layout.find(l => l.i === widget.i);
      if (layoutItem) {
        return {
          ...widget,
          x: layoutItem.x,
          y: layoutItem.y,
          w: layoutItem.w,
          h: layoutItem.h,
        };
      }
      return widget;
    });

    setWidgets(updatedWidgets);
  };

  const saveLayout = () => {
    localStorage.setItem(`dashboard-layout-${role}`, JSON.stringify(widgets));
    setIsEditMode(false);
    toast({
      title: "Layout Saved",
      description: "Your dashboard layout has been saved successfully.",
    });
  };

  const resetLayout = () => {
    setWidgets(DEFAULT_LAYOUTS[role]);
    localStorage.removeItem(`dashboard-layout-${role}`);
    toast({
      title: "Layout Reset",
      description: "Your dashboard has been reset to the default layout.",
    });
  };

  const addWidget = (componentType: string) => {
    const newWidget: Widget = {
      i: `widget-${Date.now()}`,
      x: 0,
      y: Infinity, // Add to bottom
      w: 4,
      h: 3,
      component: componentType,
      minW: 3,
      minH: 2,
    };

    setWidgets([...widgets, newWidget]);
    setShowPalette(false);
  };

  const removeWidget = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.i !== widgetId));
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 bg-card border rounded-lg">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold">
            {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {isEditMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPalette(!showPalette)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetLayout}
              >
                Reset Layout
              </Button>
            </>
          )}
          
          <Button
            variant={isEditMode ? 'default' : 'outline'}
            size="sm"
            onClick={isEditMode ? saveLayout : () => setIsEditMode(true)}
          >
            {isEditMode ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </>
            ) : (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Layout
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Widget Palette */}
      {showPalette && isEditMode && (
        <WidgetPalette onAddWidget={addWidget} onClose={() => setShowPalette(false)} />
      )}

      {/* Grid Layout */}
      <GridLayout
        className="layout"
        layout={widgets}
        cols={12}
        rowHeight={80}
        width={1200}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType="vertical"
        preventCollision={false}
        margin={[16, 16]}
        containerPadding={[0, 0]}
      >
        {widgets.map(widget => {
          const WidgetComponent = WIDGET_COMPONENTS[widget.component as keyof typeof WIDGET_COMPONENTS];
          
          return (
            <div key={widget.i} className="relative">
              <div className="h-full w-full">
                {WidgetComponent && <WidgetComponent />}
              </div>
              
              {isEditMode && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10 shadow-lg"
                  onClick={() => removeWidget(widget.i)}
                >
                  ×
                </Button>
              )}
            </div>
          );
        })}
      </GridLayout>
    </div>
  );
};
