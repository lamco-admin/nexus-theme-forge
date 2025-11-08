import React from 'react';
import { Phone, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface PerformanceData {
  calls: number;
  callsTarget: number;
  talkTime: string;
  avgTalkTime: string;
  resolution: number;
  resolutionTarget: number;
  sentiment: number;
  topSkills: string[];
}

interface AgentPerformanceWidgetProps {
  data?: PerformanceData;
}

export const AgentPerformanceWidget: React.FC<AgentPerformanceWidgetProps> = ({
  data = {
    calls: 42,
    callsTarget: 40,
    talkTime: '3h 24m',
    avgTalkTime: '4m 52s',
    resolution: 89,
    resolutionTarget: 85,
    sentiment: 0.72,
    topSkills: ['Technical Support', 'Billing'],
  },
}) => {
  const getSentimentEmoji = (score: number) => {
    if (score >= 0.7) return '😊';
    if (score >= 0.4) return '😐';
    return '☹️';
  };

  const getSentimentLabel = (score: number) => {
    if (score >= 0.7) return 'Positive';
    if (score >= 0.4) return 'Neutral';
    return 'Negative';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">My Performance - Today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span className="text-xs">Calls</span>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{data.calls}</p>
              <Progress 
                value={(data.calls / data.callsTarget) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Target: {data.callsTarget}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Talk Time</span>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{data.talkTime}</p>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Avg: {data.avgTalkTime}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">Resolution</span>
            </div>
            <div className="space-y-2">
              <p className="text-3xl font-bold">{data.resolution}%</p>
              <Progress 
                value={(data.resolution / data.resolutionTarget) * 100} 
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                Target: {data.resolutionTarget}%
              </p>
            </div>
          </div>
        </div>

        {/* Performance Chart Placeholder */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Performance Chart (Last 7 Days)</h4>
          <div className="h-32 bg-muted/50 rounded-lg flex items-end justify-around p-4">
            {[40, 50, 65, 80, 95, 75, 60].map((height, i) => (
              <div
                key={i}
                className="bg-primary/80 rounded-t w-8 transition-all hover:bg-primary"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
          <div className="flex justify-around text-xs text-muted-foreground">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="space-y-3 pt-3 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getSentimentEmoji(data.sentiment)}</span>
              <span className="text-sm text-muted-foreground">Sentiment:</span>
            </div>
            <Badge variant="secondary">
              {getSentimentLabel(data.sentiment)} ({data.sentiment.toFixed(2)})
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Top Skills:</span>
            </div>
            <div className="flex gap-2">
              {data.topSkills.map((skill) => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
