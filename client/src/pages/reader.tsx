import { useEffect, useState, useCallback } from "react";
import { useDocument, useUpdateProgress } from "@/hooks/use-documents";
import { useSettings, useUpdateSettings } from "@/hooks/use-settings";
import { RSVPDisplay } from "@/components/rsvp-display";
import { DocumentList } from "@/components/document-list";
import { FileUpload } from "@/components/file-upload";
import { ControlPanel } from "@/components/control-panel";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ReaderPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [localIndex, setLocalIndex] = useState(0);
  
  const { data: document, isLoading: isDocLoading } = useDocument(selectedId);
  const { data: settings } = useSettings();
  const { mutate: updateSettings } = useUpdateSettings();
  const { mutate: saveProgress } = useUpdateProgress();
  const { toast } = useToast();

  // Sync local index with document when document loads or changes
  useEffect(() => {
    if (document) {
      setLocalIndex(document.currentWordIndex);
      setIsPlaying(false);
    }
  }, [document?.id, document?.currentWordIndex]); // Intentional dependency on id to reset on switch

  // Auto-save progress periodically if playing
  useEffect(() => {
    if (!isPlaying || !selectedId) return;
    
    const timer = setInterval(() => {
      saveProgress({ id: selectedId, index: localIndex });
    }, 2000);

    return () => clearInterval(timer);
  }, [isPlaying, selectedId, localIndex, saveProgress]);

  // Save on pause/unmount
  useEffect(() => {
    return () => {
      if (selectedId) saveProgress({ id: selectedId, index: localIndex });
    };
  }, [selectedId, localIndex, saveProgress]);

  const handlePlayToggle = useCallback(() => {
    if (!document) return;
    setIsPlaying(prev => !prev);
    // If pausing, save immediately
    if (isPlaying && selectedId) {
      saveProgress({ id: selectedId, index: localIndex });
    }
  }, [document, isPlaying, selectedId, localIndex, saveProgress]);

  const handleSkip = useCallback((amount: number) => {
    if (!document) return;
    const words = document.content.split(/\s+/).filter(w => w.length > 0);
    setLocalIndex(prev => {
      const next = Math.max(0, Math.min(words.length - 1, prev + amount));
      return next;
    });
  }, [document]);

  const handleSpeedChange = useCallback((delta: number) => {
    if (!settings) return;
    const newWpm = Math.max(100, Math.min(1000, settings.wpm + delta));
    updateSettings({ wpm: newWpm });
    toast({
      description: `Speed: ${newWpm} WPM`,
      duration: 1000,
    });
  }, [settings, updateSettings, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayToggle();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        handleSpeedChange(25);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        handleSpeedChange(-25);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSkip(10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSkip(-10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayToggle, handleSpeedChange, handleSkip]);

  return (
    <div className="h-screen w-full bg-background text-foreground overflow-hidden">
      <ResizablePanelGroup direction="horizontal">
        
        {/* Left Panel: Library */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="border-r border-border bg-card/20">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border">
              <h1 className="text-sm font-bold tracking-widest uppercase text-primary">
                HyperRead<span className="text-foreground">.io</span>
              </h1>
            </div>
            
            <FileUpload />
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <DocumentList 
                selectedId={selectedId} 
                onSelect={(id) => {
                  if (isPlaying) handlePlayToggle();
                  setSelectedId(id);
                }} 
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle className="bg-border/50 w-[1px] hover:w-[2px] transition-all hover:bg-primary" />

        {/* Center Panel: RSVP Reader */}
        <ResizablePanel defaultSize={60}>
          {isDocLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : document ? (
            <RSVPDisplay 
              content={document.content}
              isPlaying={isPlaying}
              currentIndex={localIndex}
              onIndexChange={setLocalIndex}
              onComplete={() => {
                setIsPlaying(false);
                saveProgress({ id: document.id, index: 0 }); // Reset or keep at end? usually stop at end
                setLocalIndex(0); // Optional auto-reset
              }}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground bg-background/50">
              <div className="w-16 h-16 mb-4 rounded-full border-2 border-dashed border-border flex items-center justify-center">
                <span className="font-reader text-2xl font-bold">R</span>
              </div>
              <p className="text-lg font-medium">Ready to read</p>
              <p className="text-sm opacity-60">Select a document from the left</p>
            </div>
          )}
        </ResizablePanel>

        <ResizableHandle className="bg-border/50 w-[1px] hover:w-[2px] transition-all hover:bg-primary" />

        {/* Right Panel: Controls */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <ControlPanel 
            isPlaying={isPlaying}
            onTogglePlay={handlePlayToggle}
            onReset={() => {
              setLocalIndex(0);
              if (selectedId) saveProgress({ id: selectedId, index: 0 });
            }}
            onSkip={handleSkip}
          />
        </ResizablePanel>

      </ResizablePanelGroup>
    </div>
  );
}
