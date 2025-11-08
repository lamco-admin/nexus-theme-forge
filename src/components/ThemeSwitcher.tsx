import React from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const ThemeSwitcher: React.FC = () => {
  const { mode, variant, setMode, setVariant, toggleMode } = useTheme();

  const themes = [
    { value: 'professional', label: 'Professional', description: 'Clean and corporate' },
    { value: 'modern', label: 'Modern', description: 'Vibrant and gradient-heavy' },
    { value: 'minimal', label: 'Minimal', description: 'Clean and spacious' },
    { value: 'high-contrast', label: 'High Contrast', description: 'Maximum accessibility' },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Mode Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMode}
        className="h-9 w-9"
      >
        {mode === 'light' ? (
          <Moon className="h-4 w-4" />
        ) : (
          <Sun className="h-4 w-4" />
        )}
      </Button>

      {/* Theme Variant Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Theme Style</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {themes.map((theme) => (
            <DropdownMenuItem
              key={theme.value}
              onClick={() => setVariant(theme.value as any)}
              className="flex flex-col items-start gap-1 cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <div
                  className={`w-3 h-3 rounded-full ${
                    variant === theme.value
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                />
                <span className="font-medium">{theme.label}</span>
              </div>
              <span className="text-xs text-muted-foreground ml-5">
                {theme.description}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
