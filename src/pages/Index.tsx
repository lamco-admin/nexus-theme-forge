import { useState } from 'react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { DashboardGrid, UserRole } from '@/components/DashboardGrid';
import { ThemeBuilder } from '@/components/ThemeBuilder';
import { RoleSelector } from '@/components/RoleSelector';
import { Button } from '@/components/ui/button';
import { Settings, Paintbrush } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Index = () => {
  const [currentRole, setCurrentRole] = useState<UserRole>('agent');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">L</span>
              </div>
              <span className="font-semibold text-lg">Lamco Platform</span>
            </div>
            
            <RoleSelector 
              currentRole={currentRole} 
              onRoleChange={setCurrentRole}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Paintbrush className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Theme Builder</DialogTitle>
                  <DialogDescription>
                    Create and customize your own theme. Export it for use in WASM plugins.
                  </DialogDescription>
                </DialogHeader>
                <ThemeBuilder />
              </DialogContent>
            </Dialog>
            
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <DashboardGrid role={currentRole} key={currentRole} />
      </main>

      {/* CSS Variables Export for WASM */}
      <div 
        id="theme-css-variables" 
        data-theme-export 
        style={{ display: 'none' }}
        data-primary="hsl(var(--primary))"
        data-secondary="hsl(var(--secondary))"
        data-accent="hsl(var(--accent))"
        data-background="hsl(var(--background))"
        data-foreground="hsl(var(--foreground))"
        data-success="hsl(var(--success))"
        data-warning="hsl(var(--warning))"
        data-destructive="hsl(var(--destructive))"
        data-radius="var(--radius)"
      />
    </div>
  );
};

export default Index;
