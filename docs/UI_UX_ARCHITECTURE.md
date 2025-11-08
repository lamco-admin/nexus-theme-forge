# UI/UX Architecture - Customizable Dashboard System with WASM Plugins

**Project:** Lamco Call Center Platform
**Date:** 2025-11-08
**Focus:** Drag-and-drop customization, WASM plugins, theme engine

---

## Executive Summary

This document outlines a **highly customizable UI/UX system** with:
- **WASM plugin architecture** (client-side and server-side)
- **Drag-and-drop dashboard builder** for all user roles
- **Comprehensive theme engine** with dark mode, custom branding
- **Widget-based architecture** for maximum flexibility
- **Responsive layouts** that work on desktop, tablet, mobile

Users can customize their workspace, install plugins (widgets), and create themed experiences without touching code.

---

## WASM Plugin Architecture

### Why WASM Plugins?

**Benefits:**
1. **Security:** Sandboxed execution (can't access system)
2. **Performance:** Near-native speed
3. **Language Agnostic:** Write in Rust, C, C++, AssemblyScript, etc.
4. **Browser Compatible:** Runs in React without issues
5. **Portable:** Same plugin binary runs client and server (if designed that way)
6. **Safe:** Memory-safe, no undefined behavior
7. **Versioned:** Can load multiple versions side-by-side

**Use Cases:**
- Custom widgets for dashboards
- Data transformers (custom reports)
- CRM integrations (Salesforce, HubSpot)
- Custom dialers
- Analytics plugins
- Visualization widgets
- Industry-specific tools (healthcare, finance, etc.)

---

### Client-Side WASM Plugins (React Integration)

#### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Application                     │
│  ┌───────────────────────────────────────────────────┐  │
│  │         Dashboard Grid System                     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐       │  │
│  │  │ Widget 1 │  │ Widget 2 │  │ Widget 3 │       │  │
│  │  │ (React)  │  │ (WASM)   │  │ (React)  │       │  │
│  │  └──────────┘  └──────────┘  └──────────┘       │  │
│  └───────────────────────────────────────────────────┘  │
│                        ↓                                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │         WASM Plugin Manager                       │  │
│  │  - Load .wasm files                               │  │
│  │  - Instantiate modules                            │  │
│  │  - Bridge to React                                │  │
│  │  - Sandbox permissions                            │  │
│  └───────────────────────────────────────────────────┘  │
│                        ↓                                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │         WebAssembly Runtime (Browser)             │  │
│  │  - Execute WASM bytecode                          │  │
│  │  - Memory isolation                               │  │
│  │  - Call React hooks via imports                   │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Implementation Example

**WASM Plugin (Rust → WASM):**

```rust
// plugins/queue_stats_widget/src/lib.rs
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
pub struct QueueStats {
    queue_name: String,
    waiting: u32,
    available_agents: u32,
    avg_wait_time: f32,
}

#[wasm_bindgen]
pub struct QueueStatsWidget {
    stats: Vec<QueueStats>,
}

#[wasm_bindgen]
impl QueueStatsWidget {
    #[wasm_bindgen(constructor)]
    pub fn new() -> QueueStatsWidget {
        QueueStatsWidget {
            stats: Vec::new(),
        }
    }

    // Called from JavaScript to update data
    #[wasm_bindgen]
    pub fn update_stats(&mut self, json_data: &str) -> Result<(), JsValue> {
        self.stats = serde_json::from_str(json_data)
            .map_err(|e| JsValue::from_str(&e.to_string()))?;
        Ok(())
    }

    // Called from JavaScript to render
    #[wasm_bindgen]
    pub fn render_html(&self) -> String {
        let mut html = String::from("<div class='queue-stats'>");

        for stat in &self.stats {
            html.push_str(&format!(
                "<div class='stat-card'>
                    <h3>{}</h3>
                    <p>Waiting: {}</p>
                    <p>Agents: {}</p>
                    <p>Avg Wait: {:.1}s</p>
                </div>",
                stat.queue_name,
                stat.waiting,
                stat.available_agents,
                stat.avg_wait_time
            ));
        }

        html.push_str("</div>");
        html
    }

    // Can also render to canvas for charts
    #[wasm_bindgen]
    pub fn render_canvas(&self, ctx: &web_sys::CanvasRenderingContext2d) {
        // Draw custom visualization
        // Access canvas API from WASM
    }
}

// Export metadata
#[wasm_bindgen]
pub fn get_plugin_info() -> JsValue {
    let info = serde_json::json!({
        "name": "Queue Stats Widget",
        "version": "1.0.0",
        "author": "Lamco",
        "description": "Real-time queue statistics",
        "permissions": ["queue.read"],
        "settings_schema": {
            "refresh_interval": {
                "type": "number",
                "default": 5000,
                "label": "Refresh Interval (ms)"
            }
        }
    });
    JsValue::from_serde(&info).unwrap()
}
```

**React Integration:**

```typescript
// frontend/src/components/WasmWidget.tsx
import React, { useEffect, useRef, useState } from 'react';

interface WasmWidgetProps {
  pluginUrl: string;
  data?: any;
  settings?: any;
}

export const WasmWidget: React.FC<WasmWidgetProps> = ({
  pluginUrl,
  data,
  settings
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [plugin, setPlugin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load WASM plugin
  useEffect(() => {
    let mounted = true;

    const loadPlugin = async () => {
      try {
        // Fetch WASM binary
        const response = await fetch(pluginUrl);
        const wasmBytes = await response.arrayBuffer();

        // Instantiate WASM module
        const wasmModule = await WebAssembly.instantiate(wasmBytes, {
          // Provide imports that WASM can call
          env: {
            log: (ptr: number, len: number) => {
              // WASM can call this to log
              console.log('WASM log:', /* read memory */);
            },
            // More imports as needed
          }
        });

        if (!mounted) return;

        // Or use wasm-bindgen for easier integration
        const module = await import(pluginUrl);
        const widget = new module.QueueStatsWidget();

        setPlugin(widget);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load WASM plugin:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadPlugin();

    return () => {
      mounted = false;
    };
  }, [pluginUrl]);

  // Update plugin with new data
  useEffect(() => {
    if (plugin && data) {
      plugin.update_stats(JSON.stringify(data));

      // Re-render
      if (containerRef.current) {
        const html = plugin.render_html();
        containerRef.current.innerHTML = html;
      }
    }
  }, [plugin, data]);

  if (loading) return <div>Loading plugin...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div
      ref={containerRef}
      className="wasm-widget-container"
    />
  );
};
```

**Plugin Manager (React Context):**

```typescript
// frontend/src/contexts/PluginContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

interface PluginMetadata {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  wasmUrl: string;
  permissions: string[];
  settings_schema: any;
}

interface PluginContextType {
  plugins: Map<string, PluginMetadata>;
  installPlugin: (url: string) => Promise<void>;
  uninstallPlugin: (id: string) => void;
  getPlugin: (id: string) => PluginMetadata | undefined;
}

const PluginContext = createContext<PluginContextType | null>(null);

export const PluginProvider: React.FC = ({ children }) => {
  const [plugins, setPlugins] = useState<Map<string, PluginMetadata>>(new Map());

  // Load installed plugins from backend
  useEffect(() => {
    const loadInstalledPlugins = async () => {
      const response = await fetch('/api/v1/plugins/installed');
      const installed = await response.json();

      const pluginMap = new Map();
      for (const plugin of installed) {
        pluginMap.set(plugin.id, plugin);
      }

      setPlugins(pluginMap);
    };

    loadInstalledPlugins();
  }, []);

  const installPlugin = async (url: string) => {
    // Fetch plugin
    const response = await fetch(url);
    const wasmBytes = await response.arrayBuffer();

    // Load metadata
    const module = await WebAssembly.instantiate(wasmBytes);
    const metadata = module.instance.exports.get_plugin_info();

    // Verify signature (security)
    // Check permissions
    // Store in database

    const plugin: PluginMetadata = {
      id: metadata.name.toLowerCase().replace(/\s/g, '-'),
      ...metadata,
      wasmUrl: url,
    };

    // Save to backend
    await fetch('/api/v1/plugins/install', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plugin),
    });

    setPlugins(new Map(plugins.set(plugin.id, plugin)));
  };

  const uninstallPlugin = async (id: string) => {
    await fetch(`/api/v1/plugins/${id}`, { method: 'DELETE' });

    const newPlugins = new Map(plugins);
    newPlugins.delete(id);
    setPlugins(newPlugins);
  };

  const getPlugin = (id: string) => plugins.get(id);

  return (
    <PluginContext.Provider value={{
      plugins,
      installPlugin,
      uninstallPlugin,
      getPlugin
    }}>
      {children}
    </PluginContext.Provider>
  );
};

export const usePlugins = () => {
  const context = useContext(PluginContext);
  if (!context) throw new Error('usePlugins must be used within PluginProvider');
  return context;
};
```

---

### Server-Side WASM Plugins (Rust Runtime)

**Why Server-Side WASM?**
- Custom routing algorithms
- Data transformers
- Integration adapters (CRM, payment, etc.)
- Custom report generators
- Webhook processors

**Architecture:**

```rust
// services/plugin_runtime/src/lib.rs
use wasmtime::*;
use std::collections::HashMap;

pub struct PluginRuntime {
    engine: Engine,
    store: Store<()>,
    instances: HashMap<String, Instance>,
}

impl PluginRuntime {
    pub fn new() -> Self {
        let engine = Engine::default();
        let store = Store::new(&engine, ());

        PluginRuntime {
            engine,
            store,
            instances: HashMap::new(),
        }
    }

    pub async fn load_plugin(&mut self, id: &str, wasm_path: &str) -> Result<()> {
        // Read WASM file
        let wasm_bytes = std::fs::read(wasm_path)?;

        // Compile
        let module = Module::from_binary(&self.engine, &wasm_bytes)?;

        // Define imports (functions plugin can call)
        let mut linker = Linker::new(&self.engine);

        // Provide database access
        linker.func_wrap("env", "db_query", |query: i32| -> i32 {
            // Execute query and return result pointer
            0
        })?;

        // Provide HTTP client
        linker.func_wrap("env", "http_get", |url: i32| -> i32 {
            // Make HTTP request
            0
        })?;

        // Instantiate
        let instance = linker.instantiate(&mut self.store, &module)?;

        self.instances.insert(id.to_string(), instance);

        Ok(())
    }

    pub fn call_plugin_function(
        &mut self,
        plugin_id: &str,
        function: &str,
        args: &[wasmtime::Val],
    ) -> Result<Vec<wasmtime::Val>> {
        let instance = self.instances.get(plugin_id)
            .ok_or_else(|| anyhow::anyhow!("Plugin not found"))?;

        let func = instance
            .get_func(&mut self.store, function)
            .ok_or_else(|| anyhow::anyhow!("Function not found"))?;

        let mut results = vec![wasmtime::Val::I32(0)]; // Adjust based on return type
        func.call(&mut self.store, args, &mut results)?;

        Ok(results)
    }
}

// Example: Custom routing plugin
pub async fn route_call_with_plugin(
    runtime: &mut PluginRuntime,
    plugin_id: &str,
    call_data: CallData,
) -> Result<String> {
    // Serialize call data
    let data_json = serde_json::to_string(&call_data)?;

    // Call plugin's route() function
    // Plugin processes and returns agent ID
    let result = runtime.call_plugin_function(
        plugin_id,
        "route_call",
        &[/* pass serialized data */],
    )?;

    // Deserialize result
    Ok(/* agent_id */)
}
```

**Example Plugin (Custom Routing in Rust → WASM):**

```rust
// plugins/priority_router/src/lib.rs
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
struct CallData {
    customer_id: String,
    customer_segment: String,
    issue_type: String,
}

#[derive(Serialize)]
struct RoutingDecision {
    agent_id: String,
    priority: u32,
    reason: String,
}

// This compiles to WASM and runs server-side
#[no_mangle]
pub extern "C" fn route_call(data_ptr: *const u8, data_len: usize) -> *const u8 {
    // Read input
    let data_bytes = unsafe { std::slice::from_raw_parts(data_ptr, data_len) };
    let call_data: CallData = serde_json::from_slice(data_bytes).unwrap();

    // Custom routing logic
    let decision = if call_data.customer_segment == "VIP" {
        RoutingDecision {
            agent_id: "best_agent".to_string(),
            priority: 10,
            reason: "VIP customer".to_string(),
        }
    } else {
        RoutingDecision {
            agent_id: "any_available".to_string(),
            priority: 5,
            reason: "Standard routing".to_string(),
        }
    };

    // Return result
    let json = serde_json::to_string(&decision).unwrap();
    let bytes = json.as_bytes();

    // Allocate and return (simplified)
    bytes.as_ptr()
}
```

---

## Drag-and-Drop Dashboard Builder

### Vision

Every user (agent, supervisor, admin) can customize their workspace:
- Add/remove widgets
- Resize and reposition
- Save multiple layouts
- Share layouts with team
- Responsive (adapts to screen size)

### Architecture

**Grid System:**

```typescript
// frontend/src/components/DashboardGrid.tsx
import React, { useState } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

interface Widget {
  i: string;            // Unique ID
  x: number;            // Grid column
  y: number;            // Grid row
  w: number;            // Width in grid units
  h: number;            // Height in grid units
  minW?: number;        // Minimum width
  minH?: number;        // Minimum height
  component: string;    // Component type
  props?: any;          // Widget props
  permissions?: string[]; // Required permissions
}

interface DashboardLayout {
  id: string;
  name: string;
  role: string;         // agent, supervisor, admin
  widgets: Widget[];
  isDefault: boolean;
}

export const DashboardGrid: React.FC = () => {
  const [layout, setLayout] = useState<Widget[]>([
    { i: 'queue-stats', x: 0, y: 0, w: 6, h: 4, component: 'QueueStatsWidget' },
    { i: 'my-calls', x: 6, y: 0, w: 6, h: 4, component: 'MyCallsWidget' },
    { i: 'customer-info', x: 0, y: 4, w: 4, h: 6, component: 'CustomerInfoWidget' },
    { i: 'call-controls', x: 4, y: 4, w: 8, h: 6, component: 'CallControlsWidget' },
  ]);

  const [isEditMode, setIsEditMode] = useState(false);

  const handleLayoutChange = (newLayout: any[]) => {
    // Update layout
    const updated = newLayout.map(item => ({
      ...layout.find(w => w.i === item.i)!,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
    }));

    setLayout(updated);

    // Auto-save to backend
    saveDashboardLayout(updated);
  };

  const addWidget = (componentType: string) => {
    const newWidget: Widget = {
      i: `widget-${Date.now()}`,
      x: 0,
      y: Infinity, // Add to bottom
      w: 4,
      h: 4,
      component: componentType,
    };

    setLayout([...layout, newWidget]);
  };

  const removeWidget = (widgetId: string) => {
    setLayout(layout.filter(w => w.i !== widgetId));
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-toolbar">
        <button onClick={() => setIsEditMode(!isEditMode)}>
          {isEditMode ? 'Save Layout' : 'Edit Layout'}
        </button>

        {isEditMode && (
          <WidgetPalette onAddWidget={addWidget} />
        )}
      </div>

      <GridLayout
        className="dashboard-grid"
        layout={layout}
        cols={12}
        rowHeight={60}
        width={1200}
        onLayoutChange={handleLayoutChange}
        isDraggable={isEditMode}
        isResizable={isEditMode}
        compactType="vertical"
        preventCollision={false}
      >
        {layout.map(widget => (
          <div key={widget.i} className="widget-container">
            <WidgetRenderer
              type={widget.component}
              props={widget.props}
              isEditMode={isEditMode}
              onRemove={() => removeWidget(widget.i)}
            />
          </div>
        ))}
      </GridLayout>
    </div>
  );
};
```

**Widget Renderer:**

```typescript
// frontend/src/components/WidgetRenderer.tsx
import React from 'react';
import { WasmWidget } from './WasmWidget';

// Built-in widgets
import { QueueStatsWidget } from './widgets/QueueStatsWidget';
import { MyCallsWidget } from './widgets/MyCallsWidget';
import { CustomerInfoWidget } from './widgets/CustomerInfoWidget';
import { CallControlsWidget } from './widgets/CallControlsWidget';

// Widget registry
const WIDGET_REGISTRY = {
  'QueueStatsWidget': QueueStatsWidget,
  'MyCallsWidget': MyCallsWidget,
  'CustomerInfoWidget': CustomerInfoWidget,
  'CallControlsWidget': CallControlsWidget,
  // WASM plugins registered dynamically
};

interface WidgetRendererProps {
  type: string;
  props?: any;
  isEditMode?: boolean;
  onRemove?: () => void;
}

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  type,
  props = {},
  isEditMode = false,
  onRemove,
}) => {
  const { plugins } = usePlugins();

  // Check if it's a WASM plugin
  const plugin = plugins.get(type);

  if (plugin) {
    return (
      <WidgetWrapper title={plugin.name} isEditMode={isEditMode} onRemove={onRemove}>
        <WasmWidget pluginUrl={plugin.wasmUrl} {...props} />
      </WidgetWrapper>
    );
  }

  // Built-in widget
  const WidgetComponent = WIDGET_REGISTRY[type];

  if (!WidgetComponent) {
    return <div>Unknown widget: {type}</div>;
  }

  return (
    <WidgetWrapper title={type} isEditMode={isEditMode} onRemove={onRemove}>
      <WidgetComponent {...props} />
    </WidgetWrapper>
  );
};

const WidgetWrapper: React.FC<{
  title: string;
  isEditMode: boolean;
  onRemove?: () => void;
  children: React.ReactNode;
}> = ({ title, isEditMode, onRemove, children }) => {
  return (
    <div className="widget">
      <div className="widget-header">
        <h3>{title}</h3>
        {isEditMode && (
          <button className="widget-remove" onClick={onRemove}>
            ×
          </button>
        )}
      </div>
      <div className="widget-content">
        {children}
      </div>
    </div>
  );
};
```

**Widget Palette (Add Widgets):**

```typescript
// frontend/src/components/WidgetPalette.tsx
import React, { useState } from 'react';

interface WidgetPaletteProps {
  onAddWidget: (type: string) => void;
}

export const WidgetPalette: React.FC<WidgetPaletteProps> = ({ onAddWidget }) => {
  const [isOpen, setIsOpen] = useState(false);

  const availableWidgets = [
    { id: 'QueueStatsWidget', name: 'Queue Statistics', category: 'Analytics' },
    { id: 'MyCallsWidget', name: 'My Calls', category: 'Calls' },
    { id: 'CustomerInfoWidget', name: 'Customer Info', category: 'CRM' },
    { id: 'CallControlsWidget', name: 'Call Controls', category: 'Calls' },
    { id: 'AgentPerformanceWidget', name: 'Agent Performance', category: 'Analytics' },
    { id: 'CampaignStatsWidget', name: 'Campaign Stats', category: 'Campaigns' },
    // WASM plugins loaded dynamically
  ];

  const categories = [...new Set(availableWidgets.map(w => w.category))];

  return (
    <div className="widget-palette">
      <button onClick={() => setIsOpen(!isOpen)}>+ Add Widget</button>

      {isOpen && (
        <div className="widget-palette-modal">
          <h2>Add Widget</h2>

          {categories.map(category => (
            <div key={category} className="widget-category">
              <h3>{category}</h3>
              <div className="widget-grid">
                {availableWidgets
                  .filter(w => w.category === category)
                  .map(widget => (
                    <div
                      key={widget.id}
                      className="widget-card"
                      onClick={() => {
                        onAddWidget(widget.id);
                        setIsOpen(false);
                      }}
                    >
                      <div className="widget-icon">📊</div>
                      <div className="widget-name">{widget.name}</div>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          <button onClick={() => setIsOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
};
```

---

## Theme Engine

### Vision

- **Light/Dark modes** with one click
- **Custom brand colors** (primary, secondary, accent)
- **Multiple built-in themes** (professional, modern, minimal, high-contrast)
- **Custom themes** (create and share)
- **Per-user preferences** (saved to profile)
- **RTL support** (for Arabic)

### Implementation

**Theme System:**

```typescript
// frontend/src/themes/types.ts
export interface Theme {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      disabled: string;
    };
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      light: number;
      regular: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
}
```

**Built-in Themes:**

```typescript
// frontend/src/themes/default.ts
export const lightTheme: Theme = {
  id: 'light',
  name: 'Light',
  mode: 'light',
  colors: {
    primary: '#1976d2',      // Blue
    secondary: '#dc004e',    // Pink
    accent: '#9c27b0',       // Purple
    background: '#f5f5f5',   // Light gray
    surface: '#ffffff',      // White
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    info: '#2196f3',
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
    },
    fontWeight: {
      light: 300,
      regular: 400,
      medium: 500,
      bold: 700,
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.12)',
    md: '0 4px 6px rgba(0,0,0,0.16)',
    lg: '0 10px 20px rgba(0,0,0,0.19)',
  },
};

export const darkTheme: Theme = {
  ...lightTheme,
  id: 'dark',
  name: 'Dark',
  mode: 'dark',
  colors: {
    primary: '#90caf9',
    secondary: '#f48fb1',
    accent: '#ce93d8',
    background: '#121212',
    surface: '#1e1e1e',
    text: {
      primary: 'rgba(255, 255, 255, 0.87)',
      secondary: 'rgba(255, 255, 255, 0.6)',
      disabled: 'rgba(255, 255, 255, 0.38)',
    },
    success: '#66bb6a',
    warning: '#ffa726',
    error: '#f44336',
    info: '#29b6f6',
  },
};

// More themes
export const modernTheme: Theme = { /* ... */ };
export const minimalTheme: Theme = { /* ... */ };
export const highContrastTheme: Theme = { /* ... */ };
```

**Theme Provider:**

```typescript
// frontend/src/contexts/ThemeContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { lightTheme, darkTheme } from '../themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  customizeTheme: (customizations: Partial<Theme>) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC = ({ children }) => {
  const [availableThemes] = useState<Theme[]>([
    lightTheme,
    darkTheme,
    modernTheme,
    minimalTheme,
    highContrastTheme,
  ]);

  const [currentTheme, setCurrentTheme] = useState<Theme>(lightTheme);

  // Load user's theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      const user = await getCurrentUser();
      const themeId = user.preferences?.themeId || 'light';
      const theme = availableThemes.find(t => t.id === themeId) || lightTheme;
      setCurrentTheme(theme);
    };

    loadThemePreference();
  }, []);

  const setTheme = (themeId: string) => {
    const theme = availableThemes.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      // Save to user preferences
      saveUserPreference('themeId', themeId);
    }
  };

  const customizeTheme = (customizations: Partial<Theme>) => {
    const customTheme = {
      ...currentTheme,
      ...customizations,
      id: 'custom',
      name: 'Custom',
    };
    setCurrentTheme(customTheme);
    saveUserPreference('customTheme', customTheme);
  };

  // Convert to Material-UI theme
  const muiTheme = createTheme({
    palette: {
      mode: currentTheme.mode,
      primary: {
        main: currentTheme.colors.primary,
      },
      secondary: {
        main: currentTheme.colors.secondary,
      },
      background: {
        default: currentTheme.colors.background,
        paper: currentTheme.colors.surface,
      },
      text: {
        primary: currentTheme.colors.text.primary,
        secondary: currentTheme.colors.text.secondary,
        disabled: currentTheme.colors.text.disabled,
      },
      success: { main: currentTheme.colors.success },
      warning: { main: currentTheme.colors.warning },
      error: { main: currentTheme.colors.error },
      info: { main: currentTheme.colors.info },
    },
    typography: {
      fontFamily: currentTheme.typography.fontFamily,
      fontSize: parseFloat(currentTheme.typography.fontSize.md),
    },
    spacing: parseInt(currentTheme.spacing.md),
    shape: {
      borderRadius: parseInt(currentTheme.borderRadius.md),
    },
  });

  return (
    <ThemeContext.Provider
      value={{ currentTheme, setTheme, customizeTheme, availableThemes }}
    >
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
```

**Theme Customizer UI:**

```typescript
// frontend/src/components/ThemeCustomizer.tsx
import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

export const ThemeCustomizer: React.FC = () => {
  const { currentTheme, setTheme, customizeTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);

  const handleColorChange = (colorKey: string, color: string) => {
    customizeTheme({
      colors: {
        ...currentTheme.colors,
        [colorKey]: color,
      },
    });
  };

  return (
    <div className="theme-customizer">
      <button onClick={() => setIsOpen(!isOpen)}>
        🎨 Customize Theme
      </button>

      {isOpen && (
        <div className="theme-customizer-panel">
          <h2>Theme Settings</h2>

          {/* Preset Themes */}
          <div className="theme-presets">
            <h3>Presets</h3>
            <div className="theme-grid">
              {availableThemes.map(theme => (
                <div
                  key={theme.id}
                  className={`theme-card ${currentTheme.id === theme.id ? 'active' : ''}`}
                  onClick={() => setTheme(theme.id)}
                >
                  <div className="theme-preview">
                    <div style={{ background: theme.colors.primary }} />
                    <div style={{ background: theme.colors.secondary }} />
                    <div style={{ background: theme.colors.accent }} />
                  </div>
                  <div className="theme-name">{theme.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Color Customization */}
          <div className="theme-colors">
            <h3>Colors</h3>

            {['primary', 'secondary', 'accent', 'success', 'warning', 'error'].map(colorKey => (
              <div key={colorKey} className="color-picker-row">
                <label>{colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}</label>
                <div
                  className="color-swatch"
                  style={{ background: currentTheme.colors[colorKey] }}
                  onClick={() => setActiveColor(colorKey)}
                />
                {activeColor === colorKey && (
                  <SketchPicker
                    color={currentTheme.colors[colorKey]}
                    onChange={(color) => handleColorChange(colorKey, color.hex)}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Typography */}
          <div className="theme-typography">
            <h3>Typography</h3>
            <select
              value={currentTheme.typography.fontFamily}
              onChange={(e) => customizeTheme({
                typography: {
                  ...currentTheme.typography,
                  fontFamily: e.target.value,
                },
              })}
            >
              <option value='"Roboto", sans-serif'>Roboto</option>
              <option value='"Open Sans", sans-serif'>Open Sans</option>
              <option value='"Lato", sans-serif'>Lato</option>
              <option value='"Montserrat", sans-serif'>Montserrat</option>
            </select>
          </div>

          {/* Spacing & Border Radius */}
          <div className="theme-spacing">
            <h3>Spacing & Shape</h3>
            <label>
              Border Radius:
              <input
                type="range"
                min="0"
                max="24"
                value={parseInt(currentTheme.borderRadius.md)}
                onChange={(e) => customizeTheme({
                  borderRadius: {
                    sm: `${e.target.value / 2}px`,
                    md: `${e.target.value}px`,
                    lg: `${e.target.value * 1.5}px`,
                  },
                })}
              />
            </label>
          </div>

          <button onClick={() => setIsOpen(false)}>Done</button>
        </div>
      )}
    </div>
  );
};
```

---

## Component Library & Widget Catalog

### Core Widget Types

Let me continue with the widget specifications and mockup descriptions you can use for your design service...


### Widget Catalog - Complete Specifications

#### 1. Queue Statistics Widget
**Purpose:** Real-time overview of call queue performance
**Size:** 4x3 grid units (medium)
**Data:** Live updates every 2 seconds

**Layout:**
```
┌─────────────────────────────────────────┐
│ Queue Statistics              [Refresh] │
├─────────────────────────────────────────┤
│                                         │
│  Support Queue        Sales Queue      │
│  ┌──────────────┐    ┌──────────────┐ │
│  │  👥 12       │    │  👥 5        │ │
│  │  Waiting     │    │  Waiting     │ │
│  │              │    │              │ │
│  │  🎧 8/10     │    │  🎧 3/5      │ │
│  │  Agents      │    │  Agents      │ │
│  │              │    │              │ │
│  │  ⏱️ 45s      │    │  ⏱️ 23s      │ │
│  │  Avg Wait    │    │  Avg Wait    │ │
│  └──────────────┘    └──────────────┘ │
│                                         │
│  📊 SLA: 85% (Target: 80%)             │
│  📈 Trend: ↑ 5% from yesterday         │
└─────────────────────────────────────────┘
```

**Visual Elements:**
- Large numbers (24-36px) for key metrics
- Color-coded status: Green (< 30s), Yellow (30-60s), Red (> 60s)
- Mini trend sparklines
- Pulsing animation for real-time updates
- Card-based layout with subtle shadows

**Theme Variations:**
- Light mode: White cards on gray background
- Dark mode: Dark cards with blue glow
- High contrast: Strong borders, larger text

---

#### 2. Agent Performance Widget
**Purpose:** Individual or team performance metrics
**Size:** 6x4 grid units (large)

**Layout:**
```
┌──────────────────────────────────────────────────────┐
│ My Performance - Today                    [Settings] │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐    │
│  │ Calls      │  │ Talk Time  │  │ Resolution │    │
│  │            │  │            │  │            │    │
│  │    42      │  │   3h 24m   │  │    89%     │    │
│  │  ━━━━━━━━  │  │  ━━━━━━━━  │  │  ━━━━━━━━  │    │
│  │  Target 40 │  │  Avg 4m 52s│  │  Target 85%│    │
│  └────────────┘  └────────────┘  └────────────┘    │
│                                                       │
│  Performance Chart (Last 7 Days)                     │
│  ┌────────────────────────────────────────────────┐ │
│  │        ▁▂▃▅▇▅▃                                 │ │
│  │      ▃▅███████▇▅▃▁                            │ │
│  │    ▅███████████████▇▅▃                        │ │
│  │  ▃███████████████████████▇▅▃▁                │ │
│  │ ─────────────────────────────                 │ │
│  │ Mon Tue Wed Thu Fri Sat Sun                   │ │
│  └────────────────────────────────────────────────┘ │
│                                                       │
│  📈 Sentiment: 😊 Positive (avg 0.72)                │
│  🎯 Top Skills: Technical Support, Billing           │
└──────────────────────────────────────────────────────┘
```

**Visual Design:**
- Gauge/progress bars for targets
- Area charts for trends
- Emoji for sentiment (😊 😐 ☹️)
- Achievement badges for milestones
- Smooth animations on data updates

---

#### 3. Customer 360° Widget
**Purpose:** Complete customer information during call
**Size:** 4x6 grid units (tall)

**Layout:**
```
┌────────────────────────────────────┐
│ Customer Profile      [Edit] [+]   │
├────────────────────────────────────┤
│                                    │
│  👤 John Smith                     │
│     VIP Customer                   │
│     Member since: Jan 2023         │
│                                    │
│  📞 +1 (555) 123-4567              │
│  ✉️  john.smith@email.com          │
│  🏢 Acme Corporation               │
│                                    │
│  ─────────────────────────────     │
│                                    │
│  Recent Activity                   │
│  ┌──────────────────────────────┐ │
│  │ 📞 Call - Nov 6              │ │
│  │    Billing Question          │ │
│  │    Resolved ✓                │ │
│  │                              │ │
│  │ 💬 Chat - Nov 3              │ │
│  │    Product Inquiry           │ │
│  │    Escalated                 │ │
│  │                              │ │
│  │ 📧 Email - Nov 1             │ │
│  │    Renewal Notice Sent       │ │
│  └──────────────────────────────┘ │
│                                    │
│  Open Cases: 1                     │
│  📋 #4521 - Billing Dispute        │
│      Priority: High                │
│      Assigned: Sarah J.            │
│                                    │
│  💰 Account Value: $12,450/year    │
│  😊 Sentiment: Positive (0.78)     │
│                                    │
│  [View Full History]               │
└────────────────────────────────────┘
```

**Visual Design:**
- Avatar/initial circle at top
- Color-coded status badges (VIP, New, etc.)
- Timeline view for activity
- Expandable sections
- Quick action buttons (Call, Email, SMS)
- Hover tooltips for details

---

#### 4. Call Controls Widget
**Purpose:** Primary call interface for agents
**Size:** 8x5 grid units (large, central)

**Layout:**
```
┌──────────────────────────────────────────────────────────┐
│ Active Call - 00:04:23                      [Minimize]   │
├──────────────────────────────────────────────────────────┤
│                                                           │
│              John Smith - Acme Corp                       │
│              +1 (555) 123-4567                           │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │                                                   │   │
│  │   [████████████████░░░░░░] 75%                   │   │
│  │   AI Transcription (Live):                       │   │
│  │   "I need help with my recent invoice..."        │   │
│  │   Sentiment: 😊 Positive (0.65)                  │   │
│  │                                                   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │   🔇      │  │   ⏸️      │  │   📝      │           │
│  │   Mute    │  │   Hold    │  │   Notes   │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                           │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │   ↪️      │  │   👥      │  │   🎤      │           │
│  │ Transfer  │  │Conference │  │  Record   │           │
│  └───────────┘  └───────────┘  └───────────┘           │
│                                                           │
│  ┌───────────────────────────────────────────┐           │
│  │                                            │           │
│  │            🔴 END CALL                     │           │
│  │                                            │           │
│  └───────────────────────────────────────────┘           │
│                                                           │
│  💡 Suggested: Offer discount code SAVE10               │
└──────────────────────────────────────────────────────────┘
```

**Visual Design:**
- Large, finger-friendly buttons (48x48px minimum)
- Call timer prominent at top
- Pulsing red record indicator
- Live transcription with scrolling text
- AI suggestions in highlighted box
- Haptic feedback on button press (mobile)

---

## Complete Design System Specification

### Design Tokens

Design tokens are the visual design atoms of the system - all values that can be themed.

#### Color Palette

**Primary Colors (5 Themes):**

```
Professional Theme (Blue):
  primary-50:  #E3F2FD
  primary-100: #BBDEFB
  primary-200: #90CAF9
  primary-300: #64B5F6
  primary-400: #42A5F5
  primary-500: #2196F3  ← Main
  primary-600: #1E88E5
  primary-700: #1976D2
  primary-800: #1565C0
  primary-900: #0D47A1

Modern Theme (Purple):
  primary-500: #9C27B0
  secondary-500: #00BCD4
  accent-500: #FF5722

Minimal Theme (Gray):
  primary-500: #607D8B
  secondary-500: #455A64
  accent-500: #00ACC1

High Contrast (Black/Yellow):
  primary-500: #000000
  secondary-500: #FFEB3B
  accent-500: #FFFFFF

Nature Theme (Green):
  primary-500: #4CAF50
  secondary-500: #8BC34A
  accent-500: #FFC107
```

**Semantic Colors (Same across themes, but with light/dark variants):**

```
Success:
  light: #4CAF50  (Green)
  dark:  #66BB6A

Warning:
  light: #FF9800  (Orange)
  dark:  #FFA726

Error:
  light: #F44336  (Red)
  dark:  #EF5350

Info:
  light: #2196F3  (Blue)
  dark:  #29B6F6
```

**Neutral/Gray Scale:**

```
Light Theme Grays:
  gray-50:  #FAFAFA
  gray-100: #F5F5F5  ← Background
  gray-200: #EEEEEE
  gray-300: #E0E0E0  ← Dividers
  gray-400: #BDBDBD
  gray-500: #9E9E9E
  gray-600: #757575
  gray-700: #616161
  gray-800: #424242
  gray-900: #212121

Dark Theme Grays:
  gray-50:  #212121
  gray-100: #1E1E1E  ← Background
  gray-200: #2C2C2C  ← Surface
  gray-300: #3C3C3C
  gray-400: #4A4A4A
  gray-500: #6B6B6B
  gray-600: #8A8A8A
  gray-700: #A0A0A0
  gray-800: #C0C0C0
  gray-900: #E0E0E0
```

**Text Colors:**

```
Light Mode:
  text-primary:   rgba(0, 0, 0, 0.87)
  text-secondary: rgba(0, 0, 0, 0.60)
  text-disabled:  rgba(0, 0, 0, 0.38)
  text-hint:      rgba(0, 0, 0, 0.38)

Dark Mode:
  text-primary:   rgba(255, 255, 255, 0.87)
  text-secondary: rgba(255, 255, 255, 0.60)
  text-disabled:  rgba(255, 255, 255, 0.38)
  text-hint:      rgba(255, 255, 255, 0.50)
```

**Status Colors:**

```
Call Status:
  ringing:    #FF9800  (Orange)
  active:     #4CAF50  (Green)
  on-hold:    #FFC107  (Amber)
  ended:      #757575  (Gray)
  missed:     #F44336  (Red)

Agent Status:
  available:  #4CAF50  (Green)
  on-call:    #2196F3  (Blue)
  wrap-up:    #FF9800  (Orange)
  break:      #FFC107  (Amber)
  offline:    #757575  (Gray)
  busy:       #F44336  (Red)

Queue Priority:
  low:        #4CAF50  (Green)
  medium:     #FF9800  (Orange)
  high:       #F44336  (Red)
  urgent:     #9C27B0  (Purple, pulsing)
```

---

#### Typography

**Font Families:**

```
Primary (UI):
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               'Roboto', 'Oxygen', 'Ubuntu', 'Helvetica Neue', sans-serif

Monospace (Code, IDs):
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 
               'Monaco', 'Courier New', monospace

Arabic (RTL):
  font-family: 'Tajawal', 'Cairo', 'Noto Sans Arabic', sans-serif
```

**Type Scale:**

```
Display:
  display-1: 96px / 1.167 / -1.5px   (Hero headings)
  display-2: 60px / 1.2   / -0.5px   (Page titles)
  display-3: 48px / 1.167 / 0px      (Section headings)

Heading:
  h1: 34px / 1.235 / 0.25px
  h2: 28px / 1.334 / 0px
  h3: 24px / 1.6   / 0.15px
  h4: 20px / 1.5   / 0.15px
  h5: 16px / 1.334 / 0px
  h6: 14px / 1.6   / 0.15px

Body:
  body-1: 16px / 1.5   / 0.15px  (Primary text)
  body-2: 14px / 1.43  / 0.17px  (Secondary text)

Caption:
  caption:    12px / 1.66  / 0.4px   (Help text)
  overline:   10px / 2.66  / 1.5px   (Labels)
  overline-2: 10px / 2.66  / 1.5px   (uppercase)
```

**Font Weights:**

```
Thin:       100
Light:      300
Regular:    400  ← Body text default
Medium:     500  ← Buttons, emphasis
Semi-Bold:  600  ← Subheadings
Bold:       700  ← Headings
Extra-Bold: 800
Black:      900
```

**Line Heights:**

```
Tight:   1.25  (Headings)
Normal:  1.5   (Body text)
Relaxed: 1.75  (Long-form content)
Loose:   2.0   (Poetry, code)
```

---

#### Spacing System

**Base Unit:** 4px

```
Space Scale:
  0:   0px
  1:   4px   (0.25rem)
  2:   8px   (0.5rem)
  3:   12px  (0.75rem)
  4:   16px  (1rem)    ← Default
  5:   20px  (1.25rem)
  6:   24px  (1.5rem)
  8:   32px  (2rem)
  10:  40px  (2.5rem)
  12:  48px  (3rem)
  16:  64px  (4rem)
  20:  80px  (5rem)
  24:  96px  (6rem)

Component Spacing:
  component-padding-sm: 12px
  component-padding-md: 16px
  component-padding-lg: 24px

  section-gap-sm: 24px
  section-gap-md: 32px
  section-gap-lg: 48px

  grid-gap: 16px
```

**Margin/Padding Conventions:**

```
Inset (padding): p-4   = padding: 16px
Stack (margin-bottom): mb-4 = margin-bottom: 16px
Inline (margin-right): mr-2 = margin-right: 8px
```

---

#### Border Radius

```
none:   0px
sm:     4px   (Buttons, inputs)
md:     8px   (Cards, small)
lg:     12px  (Cards, medium)
xl:     16px  (Cards, large)
2xl:    24px  (Modal dialogs)
3xl:    32px  (Hero elements)
full:   9999px (Pills, avatars)
```

**Component-Specific:**

```
button-radius:    4px  (Professional) | 20px (Modern)
card-radius:      8px  (Professional) | 16px (Modern)
input-radius:     4px  (Professional) | 8px (Modern)
modal-radius:     12px (Professional) | 24px (Modern)
avatar-radius:    50%  (Circle)
pill-radius:      9999px
```

---

#### Shadows & Elevation

**Material Design Elevation System:**

```
Level 0 (Flat):
  shadow: none

Level 1 (Card resting):
  shadow: 0 1px 3px rgba(0,0,0,0.12), 
          0 1px 2px rgba(0,0,0,0.24)

Level 2 (Card raised):
  shadow: 0 3px 6px rgba(0,0,0,0.15),
          0 2px 4px rgba(0,0,0,0.12)

Level 3 (Card hovered):
  shadow: 0 10px 20px rgba(0,0,0,0.15),
          0 3px 6px rgba(0,0,0,0.10)

Level 4 (Modal, drawer):
  shadow: 0 14px 28px rgba(0,0,0,0.25),
          0 10px 10px rgba(0,0,0,0.22)

Level 5 (Dropdown, popover):
  shadow: 0 19px 38px rgba(0,0,0,0.30),
          0 15px 12px rgba(0,0,0,0.22)
```

**Dark Mode Adjustments:**

```
Dark mode shadows use colored glows instead:
  glow-primary: 0 0 20px rgba(33, 150, 243, 0.3)
  glow-accent:  0 0 20px rgba(156, 39, 176, 0.3)
```

**Special Effects:**

```
Inner shadow (inset):
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.06)

Colored shadow (for illustrations):
  box-shadow: 0 10px 30px rgba(33, 150, 243, 0.3)

Neumorphism (optional theme):
  box-shadow: 
    8px 8px 16px rgba(0,0,0,0.1),
    -8px -8px 16px rgba(255,255,255,0.8)
```

---

#### Grid System

**Layout Grid:**

```
Desktop (> 1280px):
  columns: 12
  gutter:  24px
  margin:  32px

Tablet (768px - 1279px):
  columns: 8
  gutter:  16px
  margin:  24px

Mobile (< 768px):
  columns: 4
  gutter:  16px
  margin:  16px
```

**Dashboard Grid (react-grid-layout):**

```
Breakpoints:
  xxl: 1920px  (12 columns, 120px/column)
  xl:  1280px  (12 columns, 90px/column)
  lg:  1024px  (12 columns, 70px/column)
  md:  768px   (8 columns, 80px/column)
  sm:  640px   (4 columns, 140px/column)
  xs:  480px   (2 columns, 200px/column)

Grid Settings:
  row-height:  60px
  gutter:      16px
  compact-type: vertical
```

**Widget Sizing:**

```
Small:   2 columns × 2 rows  (stat card)
Medium:  4 columns × 3 rows  (chart)
Large:   6 columns × 4 rows  (table)
XLarge:  8 columns × 5 rows  (call controls)
Full:    12 columns × N rows (reports)
```

---

#### Breakpoints (Responsive)

```
Mobile Small:   320px
Mobile Medium:  375px
Mobile Large:   425px
Tablet:         768px
Laptop:         1024px
Desktop:        1280px
Desktop Large:  1440px
4K:             1920px
```

**Usage:**

```scss
// Mobile-first approach
.widget {
  padding: 12px;  // Mobile
  
  @media (min-width: 768px) {
    padding: 16px;  // Tablet
  }
  
  @media (min-width: 1024px) {
    padding: 24px;  // Desktop
  }
}
```

---

#### Animation & Motion

**Duration:**

```
instant:  0ms    (Immediate feedback)
fast:     150ms  (Micro-interactions)
normal:   300ms  (Default)
slow:     500ms  (Complex transitions)
slower:   800ms  (Page transitions)
```

**Easing Functions:**

```
Ease Out (Enter):
  cubic-bezier(0.0, 0.0, 0.2, 1)
  Use for: Elements entering screen

Ease In (Exit):
  cubic-bezier(0.4, 0.0, 1, 1)
  Use for: Elements leaving screen

Ease In-Out (Transform):
  cubic-bezier(0.4, 0.0, 0.2, 1)
  Use for: Continuous animations

Spring (Bouncy):
  cubic-bezier(0.68, -0.55, 0.265, 1.55)
  Use for: Playful interactions
```

**Common Animations:**

```css
/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse (for notifications) */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* Shimmer (loading) */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

---

## UI Component Specifications

### Button Component

**Variants:**

```
Primary:     Filled with primary color
Secondary:   Outlined with primary color
Text:        No background, just text
Contained:   Filled with elevation
Outlined:    Border only
Ghost:       Minimal, subtle hover

Danger:      Red, for destructive actions
Success:     Green, for confirmations
```

**Sizes:**

```
Small:   height: 32px, padding: 8px 16px, font: 14px
Medium:  height: 40px, padding: 12px 24px, font: 16px
Large:   height: 48px, padding: 16px 32px, font: 18px
```

**States:**

```
Default:  Normal state
Hover:    Elevation +1, slight scale (1.02)
Active:   Elevation -1, slight scale (0.98)
Focus:    2px outline, 4px offset
Disabled: opacity: 0.5, cursor: not-allowed
Loading:  Spinner, text fades, button disabled
```

**Examples:**

```html
<button class="btn btn-primary btn-md">
  Save Changes
</button>

<button class="btn btn-danger btn-sm" disabled>
  Delete
</button>

<button class="btn btn-text btn-lg">
  <Icon name="phone" /> Call Now
</button>
```

---

### Input Component

**Types:**

```
Text:      Single-line text input
Textarea:  Multi-line text input
Number:    Numeric input with steppers
Tel:       Phone number (formatted)
Email:     Email validation
Password:  Obscured text, toggle visibility
Search:    With search icon, clear button
Select:    Dropdown menu
Multi-select: Chips/tags
Date:      Calendar picker
Time:      Time picker
Datetime:  Combined date+time
File:      File upload (drag & drop)
```

**Sizes:**

```
Small:   height: 32px, padding: 8px, font: 14px
Medium:  height: 40px, padding: 12px, font: 16px
Large:   height: 48px, padding: 16px, font: 18px
```

**States:**

```
Default:     Gray border
Focus:       Primary color border, glow
Error:       Red border, error message below
Success:     Green border, checkmark icon
Disabled:    Gray background, not editable
Read-only:   No border, text only
```

**Layout:**

```
┌─────────────────────────────────────────┐
│ Label *                       [Help ?]  │
│ ┌─────────────────────────────────────┐ │
│ │ Input text here...         [Icon]   │ │
│ └─────────────────────────────────────┘ │
│ Helper text or error message            │
└─────────────────────────────────────────┘

* = Required field indicator
Help ? = Tooltip on hover
Icon = Contextual (search, clear, password toggle)
```

---

### Card Component

**Variants:**

```
Default:     Flat with border
Elevated:    Shadow elevation
Outlined:    Border only, no shadow
Interactive: Hover effect, clickable
```

**Sections:**

```
┌─────────────────────────────────────────┐
│ Header                        [Actions] │ ← Optional
├─────────────────────────────────────────┤
│                                         │
│           Content Area                  │
│                                         │
├─────────────────────────────────────────┤
│ Footer (optional)                       │
└─────────────────────────────────────────┘

Header: Title + actions (icons/buttons)
Content: Main card body
Footer: Metadata, timestamp, actions
```

**Sizes:**

```
Compact:  Minimal padding (8px)
Default:  Normal padding (16px)
Spacious: Extra padding (24px)
```

**Examples:**

```
Queue Statistics Card:
  ┌─────────────────────────────┐
  │ 📊 Support Queue       [•••]│
  ├─────────────────────────────┤
  │                             │
  │  Waiting:   12              │
  │  Agents:    8 / 10          │
  │  Avg Wait:  45 seconds      │
  │                             │
  │  📈 +3 in last hour         │
  └─────────────────────────────┘

Customer Card:
  ┌─────────────────────────────┐
  │ [JD] John Doe          [Edit]
  │     Premium Member          │
  ├─────────────────────────────┤
  │ 📞 +1 555-123-4567         │
  │ ✉️  john@example.com        │
  │ 💼 Acme Corp                │
  │                             │
  │ Last contact: 2 days ago    │
  │ Sentiment: 😊 Positive      │
  └─────────────────────────────┘
```

---

### Table Component

**Features:**

```
Sortable columns:    Click header to sort
Filterable:          Search/filter per column
Selectable rows:     Checkbox selection
Expandable rows:     Show details on click
Pagination:          Page controls at bottom
Density:             Compact/Normal/Comfortable
Sticky header:       Header stays on scroll
Row actions:         Hover to show actions
```

**Layout:**

```
┌────────────────────────────────────────────────────────┐
│ Search: [___________]  [Filters ▼]  [Columns ▼]  [⚙️] │
├────────────────────────────────────────────────────────┤
│ ☐ │ Name ↑    │ Status    │ Time     │ Actions      │ │
├───┼───────────┼───────────┼──────────┼──────────────┼─┤
│ ☐ │ John Doe  │ Active    │ 00:04:23 │ [⋮]         │ │
│ ☐ │ Jane Smith│ On Hold   │ 00:02:15 │ [⋮]         │ │
│ ☐ │ Bob Jones │ Completed │ 00:08:45 │ [⋮]         │ │
├───┴───────────┴───────────┴──────────┴──────────────┴─┤
│ Showing 1-3 of 45        [←] Page 1 of 15 [→]         │
└────────────────────────────────────────────────────────┘
```

**Status Indicators:**

```
Dot notation:
  🟢 Active
  🟡 Warning
  🔴 Critical
  ⚫ Offline

Badge notation:
  [Active]    Green background
  [Warning]   Yellow background
  [Error]     Red background
  [Info]      Blue background
```

---

### Modal/Dialog Component

**Sizes:**

```
Small:   400px max-width (Confirmations)
Medium:  600px max-width (Forms)
Large:   800px max-width (Complex forms)
XLarge:  1000px max-width (Reports)
Full:    95vw max-width (Dashboards)
```

**Layout:**

```
[Backdrop - Dark overlay, click to close]

┌─────────────────────────────────────────┐
│ Title                             [✕]   │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│           Content Area                  │
│           (Scrollable)                  │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│                   [Cancel]  [Confirm]   │
└─────────────────────────────────────────┘

Header: Title + close button
Content: Form/information (scrolls if needed)
Footer: Action buttons (right-aligned)
```

**Types:**

```
Alert:       Simple message, OK button
Confirm:     Yes/No confirmation
Prompt:      Input required
Form:        Complex form in modal
Fullscreen:  Takes entire viewport
Drawer:      Slides from side
Bottom sheet: Slides from bottom (mobile)
```

**Animations:**

```
Enter: Fade in + scale (0.9 → 1.0) - 300ms
Exit:  Fade out + scale (1.0 → 0.9) - 200ms
Backdrop: Fade in/out - 200ms
```

---

### Notification/Toast Component

**Positions:**

```
Top Left      Top Center      Top Right
Center Left   Center          Center Right
Bottom Left   Bottom Center   Bottom Right
```

**Types:**

```
Success:  Green, checkmark icon
Error:    Red, X icon
Warning:  Yellow, warning icon
Info:     Blue, info icon
Default:  Gray, no icon
```

**Layout:**

```
┌─────────────────────────────────────────┐
│ [Icon] Message text           [✕]       │
│        Optional description             │
│        [Action Button]                  │
└─────────────────────────────────────────┘

Auto-dismiss: After 5 seconds (configurable)
Manual dismiss: Click [✕]
Action: Optional button for quick action
```

**Variants:**

```
Toast (Small):
  ┌──────────────────────────┐
  │ ✓ Changes saved     [✕] │
  └──────────────────────────┘

Notification (Medium):
  ┌──────────────────────────────────┐
  │ 🔔 New message from John    [✕] │
  │    "Can you help me with..."    │
  │    [Reply] [Dismiss]            │
  └──────────────────────────────────┘

Alert Banner (Full width):
  ┌──────────────────────────────────┐
  │ ⚠️  System maintenance scheduled  │
  │    Nov 10, 2:00 AM - 4:00 AM    │
  │    [Learn More]            [✕]   │
  └──────────────────────────────────┘
```

---

## Role-Specific Dashboards

### Agent Dashboard

**Layout:**

```
┌────────────────────────────────────────────────────────────┐
│ [Logo] Dashboard     [Agent: John]  [Status: ⚫ Offline ▼] │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌─────────────────────────────────┐│
│  │                  │  │                                  ││
│  │  Call Controls   │  │  Customer 360°                  ││
│  │  (Large Widget)  │  │                                  ││
│  │                  │  │                                  ││
│  └──────────────────┘  └─────────────────────────────────┘│
│                                                             │
│  ┌──────────────────┐  ┌─────────┐  ┌────────────────────┐│
│  │                  │  │         │  │                     ││
│  │  My Performance  │  │ Scripts │  │  Knowledge Base    ││
│  │                  │  │         │  │                     ││
│  └──────────────────┘  └─────────┘  └────────────────────┘│
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │  Recent Activity / Notes                                │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
└────────────────────────────────────────────────────────────┘

Key Features:
- Large call controls (primary task)
- Customer info always visible
- Quick access to scripts
- Performance metrics visible
- Minimal distractions
```

---

### Supervisor Dashboard

**Layout:**

```
┌────────────────────────────────────────────────────────────┐
│ [Logo] Supervisor     [Team: Support]  [Alerts: 3]   [⚙️]  │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │ Queue Statistics   │  │ SLA Tracking │  │ Alerts      ││
│  │                    │  │              │  │             ││
│  └────────────────────┘  └──────────────┘  └─────────────┘│
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  Real-Time Agent Monitor (Table)                      │ │
│  │  ┌────────────┬─────────┬──────────┬───────────────┐│ │
│  │  │ Agent      │ Status  │ Duration │ Customer      ││ │
│  │  ├────────────┼─────────┼──────────┼───────────────┤│ │
│  │  │ John Doe   │ 🔵 Call │ 00:04:23 │ Jane Smith   ││ │
│  │  │ Jane Smith │ 🟢 Avail│ -        │ -            ││ │
│  │  │ Bob Jones  │ 🟡 Wrap │ 00:01:15 │ -            ││ │
│  │  └────────────┴─────────┴──────────┴───────────────┘│ │
│  │  [Listen] [Whisper] [Barge] [Coach]                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────┐  ┌──────────────────────────────┐ │
│  │ Performance Trends │  │ Quality Scorecard            │ │
│  │ (Charts)           │  │                              │ │
│  └────────────────────┘  └──────────────────────────────┘ │
│                                                             │
└────────────────────────────────────────────────────────────┘

Key Features:
- Real-time team monitoring
- Quick actions (whisper, barge)
- SLA at-a-glance
- Alert notifications
- Performance analytics
```

---

### Admin Dashboard

**Layout:**

```
┌────────────────────────────────────────────────────────────┐
│ [Logo] Admin        [System Health: ✓]  [Settings ⚙️]      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐ │
│  │ Users    │  │ Queues   │  │ Campaigns│  │ Reports   │ │
│  │  245     │  │    12    │  │     8    │  │   [New]   │ │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ System Metrics                                         ││
│  │  CPU: ████░░░░░░ 40%    Memory: ██████░░░░ 60%       ││
│  │  Calls/hr: 1,234        Concurrent: 45/100           ││
│  │  Uptime: 99.97%         Storage: 234 GB / 500 GB     ││
│  └────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐ │
│  │                     │  │                              │ │
│  │ Active Users        │  │  License Usage               │ │
│  │ (Chart)             │  │  (Chart)                     │ │
│  │                     │  │                              │ │
│  └─────────────────────┘  └─────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │  Recent Activity Log                                    │
│  │  [timestamp] User john@example.com logged in            │
│  │  [timestamp] Queue 'Support' threshold reached          │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
└────────────────────────────────────────────────────────────┘

Key Features:
- System health monitoring
- User/resource management
- Configuration access
- Audit logs
- Reports and analytics
```

---

## Iconography

### Icon System

**Library:** Lucide Icons (or Heroicons, Material Symbols)

**Sizes:**

```
xs:  16x16px  (Inline text)
sm:  20x20px  (Buttons)
md:  24x24px  (Default)
lg:  32x32px  (Featured)
xl:  48x48px  (Hero)
```

**Categories & Icons:**

```
Communication:
  📞 phone           - Call/dial
  📧 mail            - Email
  💬 message-square  - Chat
  📹 video           - Video call
  🎙️ mic            - Microphone
  🔇 mic-off         - Mute
  🔊 volume-2        - Speaker

Actions:
  ▶️  play           - Start
  ⏸️  pause          - Pause
  ⏹️  square         - Stop
  ⏺️  circle         - Record
  ↪️  corner-up-right- Transfer
  ➕ plus            - Add
  ✏️  edit           - Edit
  🗑️  trash          - Delete

Navigation:
  🏠 home            - Home
  ⬅️  arrow-left     - Back
  ➡️  arrow-right    - Forward
  ⬆️  arrow-up       - Up
  ⬇️  arrow-down     - Down
  📊 bar-chart       - Analytics
  ⚙️  settings       - Settings
  👤 user            - Profile

Status:
  ✓  check          - Success
  ✕  x              - Error
  ⚠️  alert-triangle - Warning
  ℹ️  info           - Information
  ⏱️  clock          - Time
  🔔 bell            - Notification

Data:
  📈 trending-up     - Growth
  📉 trending-down   - Decline
  🔍 search          - Search
  🗂️  folder         - Folder
  📄 file            - Document
  📊 pie-chart       - Analytics
  📅 calendar        - Calendar

People:
  👤 user            - Single user
  👥 users           - Multiple users
  🧑‍💼 briefcase      - Business
  🎧 headphones      - Agent
```

**Usage:**

```typescript
import { Phone, Mail, User } from 'lucide-react';

<Phone size={24} color="#1976d2" />
<Mail size={20} strokeWidth={2} />
<User size={24} className="text-primary" />
```

---

## Accessibility (A11Y)

### WCAG 2.1 Level AA Compliance

**Color Contrast:**

```
Normal Text (< 18px):
  Minimum ratio: 4.5:1

Large Text (≥ 18px or 14px bold):
  Minimum ratio: 3:1

UI Components:
  Minimum ratio: 3:1 (borders, icons)

Examples:
  ✓ Black on white:     21:1
  ✓ #1976D2 on white:   4.6:1
  ✓ #757575 on white:   4.6:1
  ✗ #BDBDBD on white:   2.4:1  (Fails!)
```

**Keyboard Navigation:**

```
Tab Order:
  1. Skip to main content link
  2. Navigation menu
  3. Page content (logical order)
  4. Footer

Focus Indicators:
  outline: 2px solid currentColor
  outline-offset: 2px
  (Clearly visible on all interactive elements)

Shortcuts:
  Ctrl+K     - Quick search
  Ctrl+/     - Show keyboard shortcuts
  Esc        - Close modal/popover
  Space      - Play/pause
  Enter      - Confirm/submit
  Arrow keys - Navigate lists
```

**Screen Reader Support:**

```html
<!-- Proper labeling -->
<button aria-label="Call customer">
  <PhoneIcon />
</button>

<!-- Live regions for updates -->
<div aria-live="polite" aria-atomic="true">
  New message from John
</div>

<!-- Semantic HTML -->
<nav aria-label="Main navigation">...</nav>
<main>...</main>
<aside aria-label="Customer information">...</aside>

<!-- Form labels -->
<label for="customer-name">Customer Name</label>
<input id="customer-name" type="text" />

<!-- Status messages -->
<div role="status" aria-live="polite">
  Loading...
</div>
```

**Focus Management:**

```typescript
// Trap focus in modal
const Modal = () => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, []);

  return <div ref={modalRef}>...</div>;
};
```

---

## Mockup Specifications for Design Service

### What to Request from Designers

**1. Core Screens (High Priority)**

- **Agent Dashboard (Desktop)**
  - Dimensions: 1920x1080px
  - Light & Dark themes
  - Show: Call controls, customer info, performance widgets
  - State: Active call in progress
  - Include: Real-time transcription, sentiment indicator

- **Supervisor Wallboard (Desktop)**
  - Dimensions: 1920x1080px or 3840x2160px (4K for displays)
  - Real-time queue statistics
  - Agent status grid
  - SLA metrics with visual indicators
  - Alert notifications

- **Admin Console (Desktop)**
  - Dimensions: 1920x1080px
  - System configuration screens
  - User management table
  - Queue setup wizard
  - Settings panels

**2. Mobile Views (Medium Priority)**

- **Agent Mobile App (Android)**
  - Dimensions: 375x812px (iPhone X) and 360x760px (Android)
  - Simplified call controls
  - Customer info (card format)
  - Quick actions
  - Navigation: Bottom tab bar

**3. Widget Library (High Priority)**

- All widgets in small, medium, large sizes
- Light and dark theme variants
- Empty states
- Loading states
- Error states

**4. Component Library (Essential)**

- Buttons (all variants, sizes, states)
- Inputs (all types)
- Cards (all variants)
- Modals/dialogs
- Tables
- Notifications/toasts
- Navigation elements
- Icons set

**5. Style Guide**

- Color palette (all themes)
- Typography scale
- Spacing examples
- Shadow/elevation examples
- Grid system visualization

**6. User Flows (Nice to Have)**

- Agent login → taking first call → wrap-up
- Supervisor monitoring → barging into call
- Admin creating new queue

---

### File Deliverables to Request

```
Design_Package/
├── Screens/
│   ├── Agent_Dashboard_Light.fig
│   ├── Agent_Dashboard_Dark.fig
│   ├── Supervisor_Wallboard.fig
│   ├── Admin_Console.fig
│   └── Mobile_Agent_App.fig
│
├── Components/
│   ├── Buttons.fig
│   ├── Inputs.fig
│   ├── Cards.fig
│   ├── Modals.fig
│   ├── Tables.fig
│   └── Widgets.fig
│
├── Style_Guide/
│   ├── Colors.fig
│   ├── Typography.fig
│   ├── Spacing.fig
│   └── Icons.fig
│
├── Prototypes/
│   ├── Agent_Flow.fig (interactive)
│   └── Supervisor_Flow.fig
│
└── Exports/
    ├── PNG/ (all screens at 2x)
    ├── SVG/ (all icons)
    └── Design_Tokens.json
```

---

## Design Brief for Your Design Service

**Project:** Call Center Platform UI/UX Design System

**Overview:**
Design a modern, professional call center platform with customizable dashboards, multiple themes, and role-specific interfaces.

**Target Users:**
1. Agents (primary users, 8+ hours/day)
2. Supervisors (monitoring multiple agents)
3. Administrators (system configuration)

**Design Philosophy:**
- Clean, minimal, professional
- Information density without clutter
- Quick access to critical functions
- Calm color palette (reduce stress)
- Accessibility-first
- Support for light & dark themes
- RTL support for Arabic

**Deliverables Needed:**

1. **Screens** (Desktop: 1920x1080px)
   - [ ] Agent Dashboard (Light theme)
   - [ ] Agent Dashboard (Dark theme)
   - [ ] Supervisor Wallboard
   - [ ] Admin Console
   - [ ] Mobile Agent App (375x812px)

2. **Component Library**
   - [ ] Buttons (primary, secondary, danger, text, outlined)
   - [ ] Input fields (text, select, date, search)
   - [ ] Cards (default, elevated, outlined)
   - [ ] Modals/Dialogs
   - [ ] Tables (sortable, filterable)
   - [ ] Notifications/Toasts

3. **Widget Designs**
   - [ ] Queue Statistics
   - [ ] Agent Performance
   - [ ] Customer 360°
   - [ ] Call Controls
   - [ ] Real-time Transcription
   - [ ] Performance Charts

4. **Theme Variations**
   - [ ] Professional (Blue) - Light & Dark
   - [ ] Modern (Purple) - Light & Dark
   - [ ] High Contrast (Black/Yellow)

5. **Style Guide**
   - [ ] Color palettes (all themes)
   - [ ] Typography scale
   - [ ] Spacing system
   - [ ] Icon set (100+ icons)
   - [ ] Component states (hover, active, disabled)

6. **Prototypes** (Interactive Figma)
   - [ ] Agent taking a call (end-to-end flow)
   - [ ] Dashboard customization (drag & drop preview)

**Reference Designs:**
- Modern SaaS dashboards (Linear, Notion, Stripe)
- Call center platforms (Five9, Genesys Cloud)
- Material Design 3
- Tailwind UI

**File Format:** Figma (preferred) or Adobe XD
**Delivery:** Within 2-3 weeks

---

**This document provides complete specifications for implementing the UI/UX system. Use this to brief your design service and get comprehensive mockups created.**

