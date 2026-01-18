import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "@/hooks/use-settings";

interface RSVPDisplayProps {
  content: string;
  isPlaying: boolean;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  onComplete: () => void;
}

export function RSVPDisplay({ 
  content, 
  isPlaying, 
  currentIndex, 
  onIndexChange,
  onComplete 
}: RSVPDisplayProps) {
  const { data: settings } = useSettings();
  const words = useMemo(() => content.split(/\s+/).filter(w => w.length > 0), [content]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Speed calculation (ms per word)
  const wpm = settings?.wpm || 300;
  const baseDelay = 60000 / wpm;

  // ORP Calculation (Optimal Recognition Point)
  const getORP = (word: string) => {
    const len = word.length;
    let orpIndex = 0;
    if (len <= 1) orpIndex = 0;
    else if (len <= 5) orpIndex = 1;
    else if (len <= 9) orpIndex = 2;
    else orpIndex = 3; // roughly center-leftish
    
    // For very long words, true center might be better visually
    if (len > 13) orpIndex = Math.floor(len / 2) - 1;
    
    return orpIndex;
  };

  useEffect(() => {
    if (isPlaying && currentIndex < words.length) {
      const currentWord = words[currentIndex];
      
      // Pause on punctuation logic
      let delay = baseDelay;
      if (settings?.pauseOnPunctuation) {
        if (/[.!?]$/.test(currentWord)) delay *= 2.0;
        else if (/[;:]$/.test(currentWord)) delay *= 1.5;
        else if (/,$/.test(currentWord)) delay *= 1.2;
      }

      intervalRef.current = setTimeout(() => {
        if (currentIndex + 1 >= words.length) {
          onComplete();
        } else {
          onIndexChange(currentIndex + 1);
        }
      }, delay);
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [isPlaying, currentIndex, words, wpm, settings, onIndexChange, onComplete, baseDelay]);

  const currentWord = words[currentIndex] || "";
  const orpIndex = getORP(currentWord);

  const leftPart = currentWord.slice(0, orpIndex);
  const centerChar = currentWord.charAt(orpIndex);
  const rightPart = currentWord.slice(orpIndex + 1);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden bg-background">
      {/* Reticle / Focus Guides */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[2px] h-8 bg-border/30 absolute top-[40%] translate-y-[-24px]"></div>
        <div className="w-[2px] h-8 bg-border/30 absolute bottom-[40%] translate-y-[24px]"></div>
      </div>

      <div 
        className="relative flex items-baseline font-reader leading-none select-none"
        style={{ 
          fontSize: `${settings?.fontSize || 48}px`,
          fontFamily: settings?.fontFamily || 'IBM Plex Sans'
        }}
      >
        <span className="text-right text-muted-foreground w-[400px]">{leftPart}</span>
        <span className={`
          text-center w-[1ch]
          ${settings?.orpHighlight ? 'text-primary' : 'text-foreground'}
        `}>
          {centerChar}
        </span>
        <span className="text-left text-muted-foreground w-[400px]">{rightPart}</span>
      </div>

      {/* Progress Bar (Subtle) */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          transition={{ ease: "linear", duration: 0.1 }}
        />
      </div>
      
      {/* Meta Info Overlay */}
      <div className="absolute bottom-4 right-4 text-xs font-mono text-muted-foreground opacity-50">
        {currentIndex + 1} / {words.length} words
      </div>
    </div>
  );
}
