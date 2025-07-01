import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Code, Moon, Sun, Palette } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";

/**
 * Theme Demo Component
 * 
 * This component demonstrates proper theme-aware styling using our unified theme system.
 * It showcases how to replace hardcoded colors with theme-aware alternatives.
 */
export default function ThemeDemo() {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState("");
  const [textareaValue, setTextareaValue] = useState("// Example code\nconst greeting = 'Hello, World!';");

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section - Previously bg-black text-white */}
        <div className="bg-primary text-primary-foreground p-8 shadow-brutal-md">
          <h1 className="text-4xl font-black uppercase mb-4">Theme System Demo</h1>
          <p className="text-lg opacity-90">
            Current theme: <Badge variant="secondary" className="ml-2">{theme}</Badge>
          </p>
        </div>

        {/* Color Palette Display */}
        <Card className="border-2 border-border shadow-brutal-sm hover-brutal">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Color Palette
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="bg-background border-2 border-border p-4 text-center">
                <p className="text-sm font-medium">Background</p>
              </div>
              <div className="bg-secondary border-2 border-border p-4 text-center">
                <p className="text-sm font-medium">Secondary</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-primary text-primary-foreground p-4 text-center">
                <p className="text-sm font-medium">Primary</p>
              </div>
              <div className="bg-accent text-accent-foreground p-4 text-center">
                <p className="text-sm font-medium">Accent</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="bg-muted text-muted-foreground p-4 text-center">
                <p className="text-sm font-medium">Muted</p>
              </div>
              <div className="bg-card text-card-foreground border-2 border-border p-4 text-center">
                <p className="text-sm font-medium">Card</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-foreground p-4 border-2 border-border text-center">
                <p className="text-sm font-medium">Foreground</p>
              </div>
              <div className="text-muted-foreground p-4 border-2 border-border text-center">
                <p className="text-sm font-medium">Muted Text</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Interactive Elements */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Form Inputs - Fixed from forced gray colors */}
          <Card className="theme-card shadow-brutal-sm hover-brutal">
            <CardHeader>
              <CardTitle>Form Inputs (Theme-Aware)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Text Input
                </label>
                <Input
                  type="text"
                  placeholder="Type something..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="bg-background text-foreground border-border"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Textarea with Code
                </label>
                <Textarea
                  value={textareaValue}
                  onChange={(e) => setTextareaValue(e.target.value)}
                  className="bg-background text-foreground border-border font-mono"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Buttons Section */}
          <Card className="theme-card shadow-brutal-sm hover-brutal">
            <CardHeader>
              <CardTitle>Brutalist Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-brutal-sm">
                  Primary Action
                </Button>
                <Button variant="secondary" className="shadow-brutal-sm">
                  Secondary
                </Button>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-brutal-sm">
                  Accent Button
                </Button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-2">
                  Outlined
                </Button>
                <Button variant="ghost">
                  Ghost Button
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Block Example - Fixed from forced gray background */}
        <Card className="border-2 border-border shadow-brutal-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Code Block (Theme-Aware)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted text-foreground p-4 rounded-none border-2 border-border overflow-x-auto">
              <code>{`// Properly themed code block
function ThemeAwareComponent() {
  return (
    <div className="bg-background text-foreground">
      <h1 className="text-primary">
        No more hardcoded colors!
      </h1>
    </div>
  );
}`}</code>
            </pre>
          </CardContent>
        </Card>

        {/* Typography Examples */}
        <Card className="theme-card shadow-brutal-md hover-brutal">
          <CardHeader>
            <CardTitle>Typography Hierarchy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h1 className="text-4xl font-black text-foreground">Heading 1</h1>
            <h2 className="text-3xl font-bold text-foreground">Heading 2</h2>
            <h3 className="text-2xl font-semibold text-foreground">Heading 3</h3>
            <p className="text-base text-foreground">
              Primary text color that adapts to the current theme.
            </p>
            <p className="text-sm text-muted-foreground">
              Secondary text with muted appearance for less emphasis.
            </p>
            <p className="text-xs text-muted-foreground/70">
              Tertiary text for captions and metadata.
            </p>
          </CardContent>
        </Card>

        {/* Theme Toggle Demo */}
        <Card className="bg-theme-inverse text-theme-inverse p-6 shadow-brutal-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Theme Toggle Working!</h3>
              <p className="opacity-90">
                The theme toggle in the header switches between light and dark modes.
                All components adapt automatically.
              </p>
            </div>
            <div className="flex gap-2">
              {theme === 'dark' ? (
                <Moon className="w-12 h-12" />
              ) : (
                <Sun className="w-12 h-12" />
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}