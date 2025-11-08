import React from 'react';
import { Phone, Mail, Building, Calendar, DollarSign, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface CustomerData {
  name: string;
  initials: string;
  segment: string;
  memberSince: string;
  phone: string;
  email: string;
  company: string;
  accountValue: string;
  sentiment: number;
  recentActivity: {
    type: string;
    date: string;
    description: string;
    status: string;
  }[];
  openCases: {
    id: string;
    title: string;
    priority: string;
    assignedTo: string;
  }[];
}

interface CustomerProfileWidgetProps {
  data?: CustomerData;
}

export const CustomerProfileWidget: React.FC<CustomerProfileWidgetProps> = ({
  data = {
    name: 'John Smith',
    initials: 'JS',
    segment: 'VIP',
    memberSince: 'Jan 2023',
    phone: '+1 (555) 123-4567',
    email: 'john.smith@email.com',
    company: 'Acme Corporation',
    accountValue: '$12,450/year',
    sentiment: 0.78,
    recentActivity: [
      { type: 'call', date: 'Nov 6', description: 'Billing Question', status: 'Resolved' },
      { type: 'chat', date: 'Nov 3', description: 'Product Inquiry', status: 'Escalated' },
      { type: 'email', date: 'Nov 1', description: 'Renewal Notice Sent', status: 'Sent' },
    ],
    openCases: [
      { id: '#4521', title: 'Billing Dispute', priority: 'High', assignedTo: 'Sarah J.' },
    ],
  },
}) => {
  const getSentimentEmoji = (score: number) => {
    if (score >= 0.7) return '😊';
    if (score >= 0.4) return '😐';
    return '☹️';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-3 w-3" />;
      case 'chat':
        return <Activity className="h-3 w-3" />;
      case 'email':
        return <Mail className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Customer Profile</CardTitle>
        <Button variant="ghost" size="sm">
          Edit
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-semibold">
              {data.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-lg">{data.name}</h3>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{data.segment} Customer</Badge>
              <span className="text-sm text-muted-foreground">
                Member since: {data.memberSince}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{data.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{data.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{data.company}</span>
          </div>
        </div>

        <Separator />

        {/* Recent Activity */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Recent Activity</h4>
          <div className="space-y-2">
            {data.recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">
                      {activity.type} - {activity.date}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {activity.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Open Cases */}
        {data.openCases.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Open Cases</h4>
              <Badge variant="destructive" className="text-xs">
                {data.openCases.length}
              </Badge>
            </div>
            {data.openCases.map((caseItem) => (
              <div
                key={caseItem.id}
                className="p-3 rounded-lg bg-muted/50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{caseItem.id}</span>
                  <Badge variant={getPriorityVariant(caseItem.priority)}>
                    {caseItem.priority}
                  </Badge>
                </div>
                <p className="text-sm">{caseItem.title}</p>
                <p className="text-xs text-muted-foreground">
                  Assigned: {caseItem.assignedTo}
                </p>
              </div>
            ))}
          </div>
        )}

        <Separator />

        {/* Footer Info */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Account Value:</span>
            </div>
            <span className="font-semibold">{data.accountValue}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Sentiment:</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getSentimentEmoji(data.sentiment)}</span>
              <span className="font-semibold">
                Positive ({data.sentiment.toFixed(2)})
              </span>
            </div>
          </div>
        </div>

        <Button className="w-full" variant="outline">
          View Full History
        </Button>
      </CardContent>
    </Card>
  );
};
