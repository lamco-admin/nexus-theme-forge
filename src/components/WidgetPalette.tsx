import React from 'react';
import { 
  BarChart, Users, UserCircle, Phone, 
  Monitor, TrendingUp, X 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface WidgetOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

interface WidgetPaletteProps {
  onAddWidget: (type: string) => void;
  onClose: () => void;
}

const AVAILABLE_WIDGETS: WidgetOption[] = [
  {
    id: 'QueueStats',
    name: 'Queue Statistics',
    description: 'Real-time queue monitoring',
    icon: <BarChart className="h-6 w-6" />,
    category: 'Analytics',
  },
  {
    id: 'AgentPerformance',
    name: 'Agent Performance',
    description: 'Personal metrics and goals',
    icon: <TrendingUp className="h-6 w-6" />,
    category: 'Analytics',
  },
  {
    id: 'CustomerProfile',
    name: 'Customer Profile',
    description: '360° customer view',
    icon: <UserCircle className="h-6 w-6" />,
    category: 'CRM',
  },
  {
    id: 'CallControls',
    name: 'Call Controls',
    description: 'Primary call interface',
    icon: <Phone className="h-6 w-6" />,
    category: 'Calls',
  },
  {
    id: 'AgentMonitor',
    name: 'Agent Monitor',
    description: 'Real-time team monitoring',
    icon: <Monitor className="h-6 w-6" />,
    category: 'Supervisor',
  },
  {
    id: 'CampaignStats',
    name: 'Campaign Statistics',
    description: 'Campaign performance tracking',
    icon: <Users className="h-6 w-6" />,
    category: 'Campaigns',
  },
];

export const WidgetPalette: React.FC<WidgetPaletteProps> = ({ onAddWidget, onClose }) => {
  const categories = [...new Set(AVAILABLE_WIDGETS.map(w => w.category))];

  return (
    <Card className="animate-slide-up">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-lg">Add Widget</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {categories.map(category => (
          <div key={category} className="mb-6 last:mb-0">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {AVAILABLE_WIDGETS
                .filter(w => w.category === category)
                .map(widget => (
                  <button
                    key={widget.id}
                    onClick={() => onAddWidget(widget.id)}
                    className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-all text-left group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        {widget.icon}
                      </div>
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold text-sm">{widget.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {widget.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
