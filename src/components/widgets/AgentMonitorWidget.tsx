import React from 'react';
import { Phone, Headphones, Coffee, LogOut, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Agent {
  id: string;
  name: string;
  initials: string;
  status: 'available' | 'on-call' | 'wrap-up' | 'break' | 'offline';
  duration: string;
  customer?: string;
}

interface AgentMonitorWidgetProps {
  agents?: Agent[];
}

export const AgentMonitorWidget: React.FC<AgentMonitorWidgetProps> = ({
  agents = [
    { id: '1', name: 'John Doe', initials: 'JD', status: 'on-call', duration: '00:04:23', customer: 'Jane Smith' },
    { id: '2', name: 'Jane Smith', initials: 'JS', status: 'available', duration: '-' },
    { id: '3', name: 'Bob Jones', initials: 'BJ', status: 'wrap-up', duration: '00:01:15' },
    { id: '4', name: 'Alice Brown', initials: 'AB', status: 'on-call', duration: '00:12:34', customer: 'Mike Wilson' },
    { id: '5', name: 'Charlie Davis', initials: 'CD', status: 'break', duration: '00:05:00' },
    { id: '6', name: 'Emma Wilson', initials: 'EW', status: 'available', duration: '-' },
  ],
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-call':
        return <Phone className="h-3 w-3" />;
      case 'available':
        return <Headphones className="h-3 w-3" />;
      case 'break':
        return <Coffee className="h-3 w-3" />;
      case 'offline':
        return <LogOut className="h-3 w-3" />;
      default:
        return <Play className="h-3 w-3" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'on-call':
        return 'default';
      case 'wrap-up':
        return 'warning';
      case 'break':
        return 'warning';
      case 'offline':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-status-available';
      case 'on-call':
        return 'bg-status-on-call';
      case 'wrap-up':
        return 'bg-status-wrap-up';
      case 'break':
        return 'bg-status-break';
      case 'offline':
        return 'bg-status-offline';
      default:
        return 'bg-muted';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusCount = (status: string) => {
    return agents.filter(a => a.status === status).length;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Real-Time Agent Monitor</CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {agents.length} Agents
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {['available', 'on-call', 'wrap-up', 'break', 'offline'].map((status) => (
            <div key={status} className="text-center p-2 rounded-lg bg-muted/50">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status)} mx-auto mb-1`} />
              <div className="text-xs text-muted-foreground">{formatStatus(status)}</div>
              <div className="text-lg font-bold">{getStatusCount(status)}</div>
            </div>
          ))}
        </div>

        {/* Agent Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12"></TableHead>
                <TableHead>Agent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map((agent) => (
                <TableRow key={agent.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {agent.initials}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{agent.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(agent.status)} className="gap-1">
                      {getStatusIcon(agent.status)}
                      {formatStatus(agent.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{agent.duration}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {agent.customer || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {agent.status === 'on-call' && (
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Listen
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Whisper
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Barge
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Supervisor Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            Force Available
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Send Message
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
