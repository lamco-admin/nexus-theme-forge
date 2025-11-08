import React from 'react';
import { Users, Clock, TrendingUp, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface QueueData {
  name: string;
  waiting: number;
  agents: number;
  totalAgents: number;
  avgWaitTime: number;
  sla: number;
}

interface QueueStatsWidgetProps {
  queues?: QueueData[];
}

export const QueueStatsWidget: React.FC<QueueStatsWidgetProps> = ({
  queues = [
    { name: 'Support', waiting: 12, agents: 8, totalAgents: 10, avgWaitTime: 45, sla: 85 },
    { name: 'Sales', waiting: 5, agents: 3, totalAgents: 5, avgWaitTime: 23, sla: 92 },
  ],
}) => {
  const getWaitTimeColor = (seconds: number) => {
    if (seconds < 30) return 'text-success';
    if (seconds < 60) return 'text-warning';
    return 'text-destructive';
  };

  const getSLAStatus = (sla: number) => {
    if (sla >= 90) return 'success';
    if (sla >= 80) return 'warning';
    return 'destructive';
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold">Queue Statistics</CardTitle>
        <Badge variant="outline" className="text-xs">
          Live
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {queues.map((queue) => (
          <div
            key={queue.name}
            className="p-4 rounded-lg bg-muted/50 space-y-3 transition-all hover:bg-muted"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">{queue.name} Queue</h3>
              <Badge variant={getSLAStatus(queue.sla)}>
                SLA {queue.sla}%
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">Waiting</span>
                </div>
                <p className="text-2xl font-bold">{queue.waiting}</p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">Agents</span>
                </div>
                <p className="text-2xl font-bold">
                  {queue.agents}
                  <span className="text-sm text-muted-foreground">/{queue.totalAgents}</span>
                </p>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">Avg Wait</span>
                </div>
                <p className={`text-2xl font-bold ${getWaitTimeColor(queue.avgWaitTime)}`}>
                  {queue.avgWaitTime}s
                </p>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-2 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Overall SLA Target</span>
            </div>
            <span className="font-semibold">80%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-success">
              <TrendingUp className="h-4 w-4" />
              <span>Trend</span>
            </div>
            <span className="font-semibold">+5% from yesterday</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
