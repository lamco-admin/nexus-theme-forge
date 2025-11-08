import React from 'react';
import { TrendingUp, Users, Target, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CampaignData {
  name: string;
  status: 'active' | 'paused' | 'completed';
  contacted: number;
  total: number;
  conversions: number;
  conversionRate: number;
  avgDuration: string;
  trend: 'up' | 'down' | 'stable';
}

interface CampaignStatsWidgetProps {
  campaigns?: CampaignData[];
}

export const CampaignStatsWidget: React.FC<CampaignStatsWidgetProps> = ({
  campaigns = [
    {
      name: 'Summer Sale 2024',
      status: 'active',
      contacted: 1247,
      total: 5000,
      conversions: 187,
      conversionRate: 15,
      avgDuration: '4m 32s',
      trend: 'up',
    },
    {
      name: 'Customer Retention',
      status: 'active',
      contacted: 523,
      total: 1200,
      conversions: 98,
      conversionRate: 18.7,
      avgDuration: '6m 15s',
      trend: 'up',
    },
    {
      name: 'Product Launch',
      status: 'paused',
      contacted: 892,
      total: 3000,
      conversions: 67,
      conversionRate: 7.5,
      avgDuration: '3m 45s',
      trend: 'down',
    },
  ],
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'completed':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      default:
        return '→';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Campaign Statistics</CardTitle>
          <Badge variant="outline" className="text-xs">
            {campaigns.filter(c => c.status === 'active').length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {campaigns.map((campaign, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors space-y-3"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold">{campaign.name}</h3>
                <Badge variant={getStatusVariant(campaign.status)} className="text-xs">
                  {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                </Badge>
              </div>
              <div className={`text-2xl font-bold ${getTrendColor(campaign.trend)}`}>
                {getTrendIcon(campaign.trend)}
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">
                  {campaign.contacted.toLocaleString()} / {campaign.total.toLocaleString()}
                </span>
              </div>
              <Progress 
                value={(campaign.contacted / campaign.total) * 100} 
                className="h-2"
              />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Target className="h-3 w-3" />
                  <span className="text-xs">Conv. Rate</span>
                </div>
                <p className="text-lg font-bold">{campaign.conversionRate}%</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">Conversions</span>
                </div>
                <p className="text-lg font-bold">{campaign.conversions}</p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">Avg Duration</span>
                </div>
                <p className="text-lg font-bold">{campaign.avgDuration}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Summary */}
        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Contacted Today</span>
            <span className="font-semibold">
              {campaigns.reduce((sum, c) => sum + c.contacted, 0).toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Conversion Rate</span>
            <span className="font-semibold text-success">
              {(campaigns.reduce((sum, c) => sum + c.conversions, 0) / 
                campaigns.reduce((sum, c) => sum + c.contacted, 0) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
