import React, { useState } from 'react';
import { Palette, Download, Upload, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { toast } from '@/hooks/use-toast';

interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  success: string;
  warning: string;
  destructive: string;
  background: string;
  foreground: string;
}

export const ThemeBuilder: React.FC = () => {
  const [colors, setColors] = useState<ColorScheme>({
    primary: '#2196f3',
    secondary: '#f5f5f5',
    accent: '#9c27b0',
    success: '#4caf50',
    warning: '#ff9800',
    destructive: '#f44336',
    background: '#ffffff',
    foreground: '#1a1a1a',
  });

  const [borderRadius, setBorderRadius] = useState(8);
  const [themeName, setThemeName] = useState('');

  const handleColorChange = (key: keyof ColorScheme, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
    applyTheme({ ...colors, [key]: value });
  };

  const applyTheme = (scheme: ColorScheme) => {
    const root = document.documentElement;
    
    // Convert hex to HSL and apply
    Object.entries(scheme).forEach(([key, value]) => {
      const hsl = hexToHSL(value);
      root.style.setProperty(`--${key}`, hsl);
    });

    root.style.setProperty('--radius', `${borderRadius}px`);
  };

  const hexToHSL = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 0%';

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
  };

  const exportTheme = () => {
    const theme = {
      name: themeName || 'Custom Theme',
      colors,
      borderRadius,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(theme, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();

    toast({
      title: "Theme Exported",
      description: "Your custom theme has been exported successfully.",
    });
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const theme = JSON.parse(e.target?.result as string);
        setColors(theme.colors);
        setBorderRadius(theme.borderRadius);
        setThemeName(theme.name);
        applyTheme(theme.colors);
        
        toast({
          title: "Theme Imported",
          description: `"${theme.name}" has been applied successfully.`,
        });
      } catch (error) {
        toast({
          title: "Import Failed",
          description: "Invalid theme file format.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  };

  const resetTheme = () => {
    const defaultColors: ColorScheme = {
      primary: '#2196f3',
      secondary: '#f5f5f5',
      accent: '#9c27b0',
      success: '#4caf50',
      warning: '#ff9800',
      destructive: '#f44336',
      background: '#ffffff',
      foreground: '#1a1a1a',
    };
    setColors(defaultColors);
    setBorderRadius(8);
    applyTheme(defaultColors);
    
    toast({
      title: "Theme Reset",
      description: "Theme has been reset to default values.",
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Custom Theme Builder</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetTheme}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm" onClick={exportTheme}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importTheme}
                  className="hidden"
                />
              </label>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme-name">Theme Name</Label>
              <Input
                id="theme-name"
                placeholder="My Custom Theme"
                value={themeName}
                onChange={(e) => setThemeName(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(colors).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={key}
                      type="color"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value)}
                      className="h-10 w-16 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={value}
                      onChange={(e) => handleColorChange(key as keyof ColorScheme, e.target.value)}
                      className="flex-1 font-mono text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Border Radius: {borderRadius}px</Label>
                <Slider
                  value={[borderRadius]}
                  onValueChange={(value) => {
                    setBorderRadius(value[0]);
                    document.documentElement.style.setProperty('--radius', `${value[0]}px`);
                  }}
                  min={0}
                  max={24}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="p-4 border rounded-lg text-center">
                  <div 
                    className="h-16 bg-primary mb-2 mx-auto"
                    style={{ borderRadius: `${borderRadius}px` }}
                  />
                  <p className="text-sm text-muted-foreground">Buttons & Cards</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div 
                    className="h-16 bg-secondary border mb-2 mx-auto"
                    style={{ borderRadius: `${borderRadius}px` }}
                  />
                  <p className="text-sm text-muted-foreground">Inputs</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div 
                    className="h-16 bg-accent mb-2 mx-auto"
                    style={{ borderRadius: `${borderRadius * 1.5}px` }}
                  />
                  <p className="text-sm text-muted-foreground">Modals</p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="space-y-4 p-6 border rounded-lg">
              <h3 className="text-lg font-semibold">Preview</h3>
              
              <div className="flex gap-2 flex-wrap">
                <Button>Primary Button</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="destructive">Destructive</Button>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="h-16 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xs">
                  Primary
                </div>
                <div className="h-16 bg-success rounded-lg flex items-center justify-center text-success-foreground text-xs">
                  Success
                </div>
                <div className="h-16 bg-warning rounded-lg flex items-center justify-center text-warning-foreground text-xs">
                  Warning
                </div>
                <div className="h-16 bg-destructive rounded-lg flex items-center justify-center text-destructive-foreground text-xs">
                  Error
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sample Card</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    This is how your theme will look on cards and other components.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
