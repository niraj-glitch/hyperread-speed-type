import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Type,
  Eye,
  Activity,
  Download,
  Zap
} from "lucide-react";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";

interface ControlPanelProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  onSkip: (amount: number) => void;
  selectedId?: number | null;
  isMobile?: boolean;
}

export function ControlPanel({ 
  isPlaying, 
  onTogglePlay, 
  onReset,
  onSkip,
  selectedId,
  isMobile = false
}: ControlPanelProps) {
  const { data: settings } = useSettings();
  const { mutate: updateSettings } = useUpdateSettings();

  const handleDownload = () => {
    if (!selectedId) return;
    window.open(`/api/documents/${selectedId}/download`, '_blank');
  };

  const handleWpmChange = (value: number[]) => {
    updateSettings({ wpm: value[0] });
  };

  const handleFontSizeChange = (value: number[]) => {
    updateSettings({ fontSize: value[0] });
  };

  const togglePunctuationPause = (checked: boolean) => {
    updateSettings({ pauseOnPunctuation: checked });
  };

  const toggleOrpHighlight = (checked: boolean) => {
    updateSettings({ orpHighlight: checked });
  };

  const toggleSpeedRamping = (checked: boolean) => {
    updateSettings({ speedRamping: checked });
  };

  return (
    <div className={`flex flex-col h-full bg-card ${!isMobile ? 'border-l border-border' : ''}`}>
      {!isMobile && (
        <div className="p-6 border-b border-border">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Controls
          </h2>
          
          <div className="flex items-center justify-center gap-2 mb-6">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-none h-10 w-10 border-border hover:bg-secondary"
              onClick={() => onSkip(-10)}
              title="Back 10 words"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button 
              variant={isPlaying ? "destructive" : "default"} 
              className="rounded-none h-12 w-20 shadow-none"
              onClick={onTogglePlay}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-none h-10 w-10 border-border hover:bg-secondary"
              onClick={() => onSkip(10)}
              title="Forward 10 words"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs text-muted-foreground hover:text-foreground"
            onClick={onReset}
          >
            <RotateCcw className="w-3 h-3 mr-2" />
            Reset to Start
          </Button>
        </div>
      )}

      {isMobile && (
        <div className="p-4 border-b border-border">
          <h2 className="text-sm font-bold uppercase tracking-widest text-primary">
            Settings
          </h2>
        </div>
      )}

      <div className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
        {/* WPM Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center text-xs font-medium text-muted-foreground">
              <Activity className="w-3 h-3 mr-2" />
              Speed (WPM)
            </Label>
            <span className="font-mono text-lg font-bold text-primary">
              {settings?.wpm || 300}
            </span>
          </div>
          <Slider 
            min={100} 
            max={1000} 
            step={10} 
            value={[settings?.wpm || 300]} 
            onValueChange={handleWpmChange}
            className="[&_.bg-primary]:bg-primary"
          />
        </div>

        {/* Font Size Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="flex items-center text-xs font-medium text-muted-foreground">
              <Type className="w-3 h-3 mr-2" />
              Size
            </Label>
            <span className="font-mono text-sm text-foreground">
              {settings?.fontSize || 48}px
            </span>
          </div>
          <Slider 
            min={24} 
            max={96} 
            step={4} 
            value={[settings?.fontSize || 48]} 
            onValueChange={handleFontSizeChange}
          />
        </div>

        {/* Toggles */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium">Smart Pause</Label>
              <p className="text-[10px] text-muted-foreground">
                Slow down on punctuation
              </p>
            </div>
            <Switch 
              checked={settings?.pauseOnPunctuation} 
              onCheckedChange={togglePunctuationPause}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs font-medium flex items-center">
                <Zap className="w-3 h-3 mr-1" />
                Speed Ramping
              </Label>
              <p className="text-[10px] text-muted-foreground">
                Gradual speed up
              </p>
            </div>
            <Switch 
              checked={settings?.speedRamping} 
              onCheckedChange={toggleSpeedRamping}
              className="data-[state=checked]:bg-primary"
            />
          </div>

          <div className="pt-4">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs rounded-none"
              disabled={!selectedId}
              onClick={handleDownload}
            >
              <Download className="w-3 h-3 mr-2" />
              Download Source
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border text-[10px] text-muted-foreground/40 text-center font-mono uppercase">
        Use SPACE to play/pause
        <br />
        ARROWS to adjust speed
      </div>
    </div>
  );
}
