import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { DashboardShowcase } from '@/components/DashboardShowcase';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">L</span>
            </div>
            <span className="font-semibold text-lg">Lamco Platform</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto">
        <DashboardShowcase />
      </main>
    </div>
  );
};

export default Index;
