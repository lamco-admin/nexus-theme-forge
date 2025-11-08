import React, { useState, useEffect } from 'react';
import { 
  Mic, MicOff, Pause, Play, PhoneOff, PhoneForwarded, 
  Users, Radio, FileText, Lightbulb 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface CallControlsWidgetProps {
  customerName?: string;
  customerPhone?: string;
  isActive?: boolean;
}

export const CallControlsWidget: React.FC<CallControlsWidgetProps> = ({
  customerName = 'John Smith',
  customerPhone = '+1 (555) 123-4567',
  isActive = true,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Active Call - {formatDuration(callDuration)}
          </CardTitle>
          <Badge variant={isActive ? 'success' : 'secondary'}>
            {isActive ? 'Live' : 'Idle'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Info */}
        <div className="text-center space-y-2 pb-4 border-b">
          <h3 className="text-2xl font-bold">{customerName}</h3>
          <p className="text-muted-foreground">{customerPhone}</p>
        </div>

        {/* AI Transcription */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">AI Transcription (Live)</span>
            <Progress value={75} className="w-20 h-2" />
          </div>
          <p className="text-sm text-muted-foreground italic">
            "I need help with my recent invoice. The amount seems incorrect..."
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sentiment:</span>
            <span className="text-lg">😊</span>
            <Badge variant="success" className="text-xs">Positive (0.65)</Badge>
          </div>
        </div>

        {/* Primary Controls */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={isMuted ? 'destructive' : 'outline'}
            size="lg"
            className="h-20 flex-col gap-2"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
            <span className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>

          <Button
            variant={isOnHold ? 'warning' : 'outline'}
            size="lg"
            className="h-20 flex-col gap-2"
            onClick={() => setIsOnHold(!isOnHold)}
          >
            {isOnHold ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
            <span className="text-xs">{isOnHold ? 'Resume' : 'Hold'}</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-20 flex-col gap-2"
          >
            <FileText className="h-6 w-6" />
            <span className="text-xs">Notes</span>
          </Button>
        </div>

        {/* Secondary Controls */}
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-20 flex-col gap-2"
          >
            <PhoneForwarded className="h-6 w-6" />
            <span className="text-xs">Transfer</span>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-20 flex-col gap-2"
          >
            <Users className="h-6 w-6" />
            <span className="text-xs">Conference</span>
          </Button>

          <Button
            variant={isRecording ? 'destructive' : 'outline'}
            size="lg"
            className="h-20 flex-col gap-2"
            onClick={() => setIsRecording(!isRecording)}
          >
            <Radio className={isRecording ? 'animate-pulse' : ''} />
            <span className="text-xs">{isRecording ? 'Stop' : 'Record'}</span>
          </Button>
        </div>

        {/* End Call Button */}
        <Button
          variant="destructive"
          size="lg"
          className="w-full h-16 text-lg font-semibold"
        >
          <PhoneOff className="h-6 w-6 mr-2" />
          END CALL
        </Button>

        {/* AI Suggestion */}
        <div className="bg-info/10 border border-info/20 rounded-lg p-3 flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">AI Suggestion</p>
            <p className="text-xs text-muted-foreground">
              Offer discount code SAVE10 for billing issues
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
